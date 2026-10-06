import * as THREE from "three";
import type { CarZones } from "@/data/cars";

/**
 * Shader extensions for the car.
 * Every effect is computed in the car's own model space (vCarPos), so film coverage,
 * cut lines, paint wipes and tint bands stay glued to the body while the car turns.
 */

const carSpaceVertex = /* glsl */ `
  #include <project_vertex>
  vCarPos = (uCarInv * modelMatrix * vec4(transformed, 1.0)).xyz;
`;

export type PaintUniforms = ReturnType<typeof createPaintUniforms>;

export function createPaintUniforms(zones: CarZones) {
  return {
    uCarInv: { value: new THREE.Matrix4() },
    // zones (model space)
    uZPartial: { value: zones.partialZ },
    uZFull: { value: zones.fullZ },
    uMirrorMin: { value: new THREE.Vector3(...zones.mirrorMin) },
    uMirrorMax: { value: new THREE.Vector3(...zones.mirrorMax) },
    uRocker: { value: new THREE.Vector4(...zones.rocker) },
    uApA: { value: new THREE.Vector3(...zones.apA) },
    uApB: { value: new THREE.Vector3(...zones.apB) },
    uApR: { value: zones.apR },
    uFront: { value: zones.frontZ },
    uRear: { value: zones.rearZ },
    // film
    uFilm: { value: 0 }, // 0..4 chosen tier
    uFilmMix: { value: 0 }, // 0..1 eased coverage strength
    uFilmRough: { value: 0.02 },
    uFilmMetal: { value: 1 },
    uFilmCC: { value: 1 },
    uFilmCCR: { value: 0.01 },
    uLines: { value: 0 }, // 0..1 visibility of cut lines
    uHover: { value: -1 }, // hovered tier for preview
    // ceramic
    uCeramic: { value: 0 },
    // paint wipe
    uPrevColor: { value: new THREE.Color("#b8141f") },
    uWipeZ: { value: -10 },
    // light sweep across the body
    uSweepZ: { value: 10 },
    uSweepAmt: { value: 0 },
    // compare: fragments left of this x (device px) render factory finish
    uSplit: { value: -1 },
    uTime: { value: 0 },
  };
}

const paintFragmentPars = /* glsl */ `
  #include <common>
  varying vec3 vCarPos;
  uniform float uZPartial, uZFull, uApR, uFront, uRear;
  uniform vec3 uMirrorMin, uMirrorMax, uApA, uApB;
  uniform vec4 uRocker;
  uniform float uFilm, uFilmMix, uFilmRough, uFilmMetal, uFilmCC, uFilmCCR, uLines, uHover;
  uniform float uCeramic, uWipeZ, uSweepZ, uSweepAmt, uSplit, uTime;
  uniform vec3 uPrevColor;

  float sdBoxAbsX(vec3 p, vec3 mn, vec3 mx) {
    vec3 q = vec3(abs(p.x), p.y, p.z);
    vec3 d = max(mn - q, q - mx);
    return max(max(d.x, d.y), d.z);
  }
  float sdCapsuleAbsX(vec3 p, vec3 a, vec3 b, float r) {
    vec3 q = vec3(abs(p.x), p.y, p.z);
    vec3 pa = q - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h) - r;
  }
  float zoneDist(float tier, vec3 p) {
    if (tier < 0.5) return 1.0;
    if (tier > 3.5) return -1.0;
    float mirror = sdBoxAbsX(p, uMirrorMin, uMirrorMax);
    float d = (tier < 1.5) ? (uZPartial - p.z) : (uZFull - p.z);
    d = min(d, mirror);
    if (tier > 2.5) {
      vec3 q = vec3(abs(p.x), p.y, p.z);
      float rocker = max(max(q.y - uRocker.x, uRocker.y - q.x), max(uRocker.z - q.z, q.z - uRocker.w));
      d = min(d, rocker);
      d = min(d, sdCapsuleAbsX(p, uApA, uApB, uApR));
    }
    return d;
  }
  float cutLine(float d) {
    float w = fwidth(d) * 1.1 + 0.0016;
    return 1.0 - smoothstep(w * 0.5, w, abs(d));
  }
  float dashes(vec3 p) {
    return step(0.45, fract((p.x * 0.7 + p.y + p.z * 0.35) * 22.0));
  }
`;

export function makePaintMaterial(base: {
  color: string;
  metallic: boolean;
}, uniforms: PaintUniforms) {
  const m = new THREE.MeshPhysicalMaterial({
    color: base.color,
    metalness: base.metallic ? 0.62 : 0.02,
    roughness: base.metallic ? 0.3 : 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: 1.0,
  });
  m.name = "pwc-paint";
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vCarPos;\nuniform mat4 uCarInv;")
      .replace("#include <project_vertex>", carSpaceVertex);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", paintFragmentPars)
      .replace(
        "#include <color_fragment>",
        /* glsl */ `#include <color_fragment>
        float isNew = step(uWipeZ, vCarPos.z);
        diffuseColor.rgb = mix(uPrevColor, diffuseColor.rgb, isNew);
        float factorySide = (uSplit >= 0.0) ? step(gl_FragCoord.x, uSplit) : 0.0;
        float dChosen = zoneDist(uFilm, vCarPos);
        float covered = (1.0 - smoothstep(-0.004, 0.004, dChosen)) * uFilmMix * (1.0 - factorySide);
        float ceramic = uCeramic * (1.0 - factorySide);`
      )
      .replace(
        "#include <roughnessmap_fragment>",
        /* glsl */ `#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, roughnessFactor * 0.55, ceramic);
        roughnessFactor = mix(roughnessFactor, uFilmRough, covered);`
      )
      .replace(
        "#include <metalnessmap_fragment>",
        /* glsl */ `#include <metalnessmap_fragment>
        metalnessFactor = mix(metalnessFactor, metalnessFactor * uFilmMetal, covered);`
      )
      .replace(
        "#include <emissivemap_fragment>",
        /* glsl */ `#include <emissivemap_fragment>
        // nested cut lines: chosen tier solid and bright, other tiers dashed and dim
        float lines = 0.0;
        for (int i = 1; i <= 3; i++) {
          float t = float(i);
          float l = cutLine(zoneDist(t, vCarPos));
          float chosen = 1.0 - step(0.5, abs(t - uFilm));
          float hovered = 1.0 - step(0.5, abs(t - uHover));
          float dim = dashes(vCarPos) * 0.22;
          lines = max(lines, l * mix(dim, 1.0, max(chosen * 0.95, hovered * 0.7)));
        }
        totalEmissiveRadiance += vec3(0.93, 0.96, 1.0) * lines * uLines * 1.15;
        // wipe seam: a thin band of light where new paint meets old
        float seam = exp(-pow((vCarPos.z - uWipeZ) / 0.035, 2.0));
        totalEmissiveRadiance += vec3(1.0) * seam * 1.6 * step(-9.0, uWipeZ);
        // sweep: a soft band of light travelling along the body
        float sweep = exp(-pow((vCarPos.z - uSweepZ) / 0.18, 2.0)) * uSweepAmt;
        totalEmissiveRadiance += vec3(0.85, 0.9, 1.0) * sweep * 0.35;`
      )
      .replace(
        "#include <lights_physical_fragment>",
        /* glsl */ `#include <lights_physical_fragment>
        #ifdef USE_CLEARCOAT
          material.clearcoatRoughness = mix(material.clearcoatRoughness, 0.012, ceramic);
          material.clearcoat = mix(material.clearcoat, uFilmCC, covered);
          material.clearcoatRoughness = mix(material.clearcoatRoughness, uFilmCCR, covered);
        #endif`
      );
  };
  m.customProgramCacheKey = () => "pwc-paint-v2";
  return m;
}

/** Window glass with per-zone tint, a windshield sun strip, test-strip preview and compare split.
 *  kind "auto" classifies one combined glass mesh by position: side if |x| > sideAbsX, else windshield ahead of wsZ, else rear. */
export type GlassUniforms = ReturnType<typeof createGlassUniforms>;
export function createGlassUniforms(zones: CarZones) {
  return {
    uCarInv: { value: new THREE.Matrix4() },
    uBPillar: { value: zones.bPillarZ },
    uStripY: { value: zones.stripY },
    uWsZ: { value: zones.wsZ },
    uSideX: { value: zones.sideAbsX },
    uFrontDark: { value: 0 },
    uRearDark: { value: 0 },
    uWsDark: { value: 0 },
    uWsStrip: { value: 0 },
    uTestStrip: { value: 0 },
    uStripRange: { value: new THREE.Vector2(zones.sideMinZ, zones.sideMaxZ) },
    uSplit: { value: -1 },
  };
}

export type GlassKind = "side" | "windshield" | "rear" | "auto";

export function makeGlassMaterial(kind: GlassKind, uniforms: GlassUniforms) {
  const m = new THREE.MeshPhysicalMaterial({
    color: "#0a0d12",
    metalness: 0,
    roughness: 0.02,
    transparent: true,
    opacity: 0.5,
    envMapIntensity: 2.2,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    depthWrite: false,
  });
  m.name = `pwc-glass-${kind}`;
  const kindId = { side: 0, windshield: 1, rear: 2, auto: 3 }[kind];
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vCarPos;\nuniform mat4 uCarInv;")
      .replace("#include <project_vertex>", carSpaceVertex);
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
        varying vec3 vCarPos;
        uniform float uBPillar, uStripY, uWsZ, uSideX, uFrontDark, uRearDark, uWsDark, uWsStrip, uTestStrip, uSplit;
        uniform vec2 uStripRange;`
      )
      .replace(
        "#include <color_fragment>",
        /* glsl */ `#include <color_fragment>
        int kind = ${kindId};
        if (kind == 3) kind = abs(vCarPos.x) > uSideX ? 0 : (vCarPos.z > uWsZ ? 1 : 2);
        float dark = 0.0;
        if (kind == 0) {
          dark = vCarPos.z > uBPillar ? uFrontDark : uRearDark;
          if (uTestStrip > 0.5) {
            float t = clamp((vCarPos.z - uStripRange.x) / (uStripRange.y - uStripRange.x), 0.0, 0.999);
            dark = 0.18 + floor(t * 6.0) * 0.152;
          }
        } else if (kind == 1) {
          dark = max(uWsDark, step(uStripY, vCarPos.y) * uWsStrip * 0.9);
        } else {
          dark = uRearDark;
        }
        if (uSplit >= 0.0 && gl_FragCoord.x < uSplit) dark = 0.0;
        diffuseColor.a = mix(diffuseColor.a, 0.975, dark);
        diffuseColor.rgb *= (1.0 - 0.75 * dark);`
      );
  };
  m.customProgramCacheKey = () => `pwc-glass-${kind}-v2`;
  return m;
}

/** Lamps: front lamps glow white with uDrl; rear lamps glow red with uTail and ignite from the center outward. */
export type LampUniforms = {
  uCarInv: { value: THREE.Matrix4 };
  uDrl: { value: number };
  uTail: { value: number };
  uReveal: { value: number };
};

export function makeLampMaterial(src: THREE.MeshStandardMaterial, uniforms: LampUniforms, opts: { band?: boolean } = {}) {
  const m = new THREE.MeshStandardMaterial({
    color: src.color?.clone() ?? new THREE.Color("#222"),
    map: src.map ?? null,
    transparent: src.transparent,
    opacity: src.opacity,
    alphaTest: src.alphaTest,
    roughness: 0.2,
    metalness: 0.1,
    emissive: new THREE.Color("#ffffff"),
    emissiveMap: src.map ?? null,
    emissiveIntensity: 1,
    side: THREE.FrontSide, // back faces would glow through the cabin glass
    depthWrite: src.depthWrite,
  });
  m.name = "pwc-lamp";
  m.toneMapped = false;
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vCarPos;\nuniform mat4 uCarInv;")
      .replace("#include <project_vertex>", carSpaceVertex);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vCarPos;\nuniform float uDrl, uTail, uReveal;")
      .replace(
        "#include <emissivemap_fragment>",
        /* glsl */ `#include <emissivemap_fragment>
        float isFront = step(0.0, vCarPos.z);
        float reveal = smoothstep(uReveal + 0.03, uReveal - 0.03, abs(vCarPos.x));
        vec3 lamp = mix(vec3(1.0, 0.04, 0.06) * uTail * reveal * 3.2, vec3(0.92, 0.96, 1.0) * uDrl * 3.0, isFront);
        // textured lenses keep their pattern but never go fully dark when lit
        float texLum = max(totalEmissiveRadiance.r, max(totalEmissiveRadiance.g, totalEmissiveRadiance.b));
        ${opts.band
          ? "totalEmissiveRadiance = lamp * (1.0 - 0.72 * smoothstep(0.35, 0.8, texLum)); // the band burns red, its lettering stays dark"
          : "totalEmissiveRadiance = lamp * (0.25 + 0.75 * texLum);"}`
      );
  };
  m.customProgramCacheKey = () => (opts.band ? "pwc-lamp-band-v5" : "pwc-lamp-v5");
  return m;
}

/** Darkness (0..1) for a visible-light-transmission percentage. */
export function vltToDark(vlt: number | null) {
  if (vlt === null) return 0;
  return THREE.MathUtils.clamp(1 - Math.pow(vlt / 100, 0.75) * 1.05, 0.12, 0.96);
}
