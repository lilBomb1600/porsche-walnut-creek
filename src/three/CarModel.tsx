"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { CarSpec } from "@/data/cars";
import { makeEuroPlateTexture, PLATE_SIZE } from "./euroPlate";
import {
  createGlassUniforms,
  createPaintUniforms,
  makeGlassMaterial,
  makeLampMaterial,
  makePaintMaterial,
  type LampUniforms,
} from "./materials";

/** Mutable targets the car eases toward every frame. Written by the studio store or a scroll timeline. */
export type CarRig = {
  paint: string;
  metallic: boolean;
  film: number;
  finish: "gloss" | "satin" | "matte";
  lines: number;
  hover: number;
  frontDark: number;
  rearDark: number;
  wsDark: number;
  wsStrip: number;
  testStrip: number;
  ceramic: number;
  drl: number;
  tail: number;
  reveal: number;
  split: number; // css px from canvas left, -1 = off
  sweepAt: number; // performance.now() when a light sweep should start
  instant?: boolean; // skip easing on the next frame
};

export const defaultRig = (over: Partial<CarRig> = {}): CarRig => ({
  paint: "#b8141f",
  metallic: false,
  film: 0,
  finish: "gloss",
  lines: 0,
  hover: -1,
  frontDark: 0,
  rearDark: 0,
  wsDark: 0,
  wsStrip: 0,
  testStrip: 0,
  ceramic: 0,
  drl: 1,
  tail: 1,
  reveal: 1,
  split: -1,
  sweepAt: -1,
  ...over,
});

const FINISH: Record<CarRig["finish"], { rough: number; metal: number; cc: number; ccr: number }> = {
  gloss: { rough: 0.05, metal: 1, cc: 1, ccr: 0.008 },
  satin: { rough: 0.34, metal: 0.7, cc: 0.35, ccr: 0.38 },
  matte: { rough: 0.62, metal: 0.45, cc: 0, ccr: 0.6 },
};

/**
 * Mount German plates on the bumpers. Height comes from the file's own plate meshes when it has them,
 * otherwise from the spec; depth is found by casting rays across the plate's footprint so it sits
 * just proud of the most forward (or rearmost) surface behind it, wherever the bumper curves.
 */
function mountPlates(root: THREE.Object3D, spec: CarSpec) {
  const cfg = spec.plate;
  if (!cfg) return;
  const sn = THREE.PropertyBinding.sanitizeNodeName;
  const own = spec.materials.plates ?? [];
  const saved = root.position.clone();
  root.position.set(0, 0, 0);
  root.updateMatrixWorld(true);

  const heights: { side: 1 | -1; y: number }[] = [];
  // the file's own plates (by mesh name or material); one mesh may hold both, so split its vertices front from rear
  const span = { 1: [Infinity, -Infinity], [-1]: [Infinity, -Infinity] } as Record<1 | -1, [number, number]>;
  const v = new THREE.Vector3();
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const matName = (mesh.material as THREE.Material)?.name;
    const mine = own.some((x) => sn(x) === mesh.name) || (!!spec.materials.plateMaterial && matName === spec.materials.plateMaterial);
    if (!mine) return;
    const pos = mesh.geometry.getAttribute("position");
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
      const sd = v.z > 0 ? 1 : -1;
      span[sd][0] = Math.min(span[sd][0], v.y);
      span[sd][1] = Math.max(span[sd][1], v.y);
    }
    mesh.visible = false;
  });
  for (const sd of [1, -1] as const) if (span[sd][0] < Infinity) heights.push({ side: sd, y: (span[sd][0] + span[sd][1]) / 2 });
  if (!heights.some((h) => h.side === 1) && cfg.front !== undefined) heights.push({ side: 1, y: cfg.front });
  if (!heights.some((h) => h.side === -1) && cfg.rear !== undefined) heights.push({ side: -1, y: cfg.rear });

  const solid: THREE.Object3D[] = [];
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    let vis = true;
    for (let p: THREE.Object3D | null = mesh; p; p = p.parent) if (!p.visible) vis = false;
    const mat = mesh.material as THREE.Material;
    if (vis && !(mat.transparent && mat.opacity < 0.5)) solid.push(mesh);
  });

  const u = 1 / spec.scale; // car space is the file's units
  const w = PLATE_SIZE.w * u;
  const h = PLATE_SIZE.h * u;
  const tex = makeEuroPlateTexture(cfg.text);
  const face = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.38, metalness: 0, envMapIntensity: 0.55 });
  const back = new THREE.MeshStandardMaterial({ color: "#0b0c0e", roughness: 0.6 });
  face.name = "pwc-plate";
  back.name = "pwc-plate-holder";
  const ray = new THREE.Raycaster();
  const dir = new THREE.Vector3();
  const from = new THREE.Vector3();

  for (const { side, y } of heights) {
    let edge = -Infinity * side;
    let hits = 0;
    for (const fx of [-0.48, -0.32, -0.16, 0, 0.16, 0.32, 0.48])
      for (const fy of [-0.4, 0, 0.4]) {
        from.set(fx * w, y + fy * h, side * 50);
        dir.set(0, 0, -side);
        ray.set(from, dir);
        const hit = ray.intersectObjects(solid, false)[0];
        if (!hit) continue;
        hits++;
        edge = side === 1 ? Math.max(edge, hit.point.z) : Math.min(edge, hit.point.z);
      }
    if (!hits) continue;
    const z = edge + side * 0.006 * u;
    const plate = new THREE.Group();
    plate.position.set(0, y, z);
    plate.rotation.y = side === 1 ? 0 : Math.PI;
    const holder = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.025, h * 1.12), back);
    holder.position.z = -0.002 * u;
    const plateMesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), face);
    plateMesh.castShadow = true;
    plateMesh.receiveShadow = true;
    plate.add(holder, plateMesh);
    plate.userData.euroPlate = true;
    root.add(plate);
  }
  root.position.copy(saved);
  root.updateMatrixWorld(true);
}

export function CarModel({
  spec,
  rig,
  ...props
}: { spec: CarSpec; rig: React.RefObject<CarRig> } & Omit<React.ComponentProps<"group">, "children">) {
  const { scene } = useGLTF(spec.file, "/draco/");
  const inner = useRef<THREE.Group>(null!);

  const built = useMemo(() => {
    const root = scene.clone(true);
    const paintU = createPaintUniforms(spec.zones);
    const glassU = createGlassUniforms(spec.zones);
    const lampU: LampUniforms = {
      uCarInv: paintU.uCarInv,
      uDrl: { value: 0 },
      uTail: { value: 0 },
      uReveal: { value: 0 },
    };
    glassU.uCarInv = paintU.uCarInv;

    const startRig = rig.current;
    const paint = makePaintMaterial({ color: startRig?.paint ?? "#b8141f", metallic: !!startRig?.metallic }, paintU);
    const glass = {
      side: makeGlassMaterial("side", glassU),
      windshield: makeGlassMaterial("windshield", glassU),
      rear: makeGlassMaterial("rear", glassU),
      auto: makeGlassMaterial("auto", glassU),
    };
    const lampCache = new Map<string, THREE.Material>();
    const lamp = (src: THREE.Material, band = false) => {
      const key = `${src.uuid}-${band}`;
      if (!lampCache.has(key)) lampCache.set(key, makeLampMaterial(src as THREE.MeshStandardMaterial, lampU, { band }));
      return lampCache.get(key)!;
    };
    // GLTFLoader sanitizes node names ("Plane.006_0" -> "Plane006_0"), so compare sanitized forms
    const sn = THREE.PropertyBinding.sanitizeNodeName;
    const has = (list: string[] | undefined, name: string) => !!list?.some((x) => sn(x) === name);
    const is = (x: string | undefined, name: string) => !!x && sn(x) === name;
    const m = spec.materials;

    // glTF leaves metallic/roughness at 1.0 when unset, which renders trim as rough metal. Give each family its real finish.
    const realCache = new Map<string, THREE.Material>();
    const realistic = (src: THREE.MeshStandardMaterial) => {
      const key = src.uuid;
      if (realCache.has(key)) return realCache.get(key)!;
      const r = src.clone() as THREE.MeshStandardMaterial;
      const n = src.name.toLowerCase();
      const set = (o: Partial<THREE.MeshStandardMaterial>) => Object.assign(r, o);
      if (n === "full_black" || n === "black") set({ color: new THREE.Color("#0a0a0b"), metalness: 0, roughness: 0.55 });
      else if (n === "plastic" || n === "930_plastics") set({ metalness: 0, roughness: 0.45 });
      else if (n === "silver" || n === "930_chromes") set({ metalness: 1, roughness: 0.14 });
      else if (n === "rubber" || n === "930_tire") {
        set({ color: new THREE.Color("#141414"), metalness: 0, roughness: 0.88 });
        if (r.normalScale) r.normalScale.set(2, 2);
      } else if (n === "glass" || n === "930_lights_refraction") set({ transparent: true, opacity: 0.16, metalness: 0, roughness: 0, depthWrite: false });
      else if (n === "material.001") set({ metalness: 0.15, roughness: 0.32 });
      else if (n === "930_rim") set({ metalness: 0.85, roughness: 0.28 });
      r.envMapIntensity = 1.15;
      realCache.set(key, r);
      return r;
    };

    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const matName = mat?.name ?? "";
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      if (has(m.hide, mesh.name) || m.hideMaterials?.includes(matName)) {
        mesh.visible = false;
        return;
      }
      if (m.paint.includes(matName)) mesh.material = paint;
      else if (is(m.windshield, mesh.name)) mesh.material = glass.windshield;
      else if (is(m.rearWindow, mesh.name)) mesh.material = glass.rear;
      else if (is(m.sideWindows, mesh.name)) mesh.material = glass.side;
      else if (m.glassMaterial && matName === m.glassMaterial) mesh.material = glass.auto;
      else if (
        has(m.frontLights, mesh.name) ||
        has(m.tailLights, mesh.name) ||
        m.lampMaterials?.includes(matName)
      )
        mesh.material = lamp(mat, is(m.band, mesh.name));
      else if (matName === "window") {
        mesh.material = glass.side;
      } else {
        mesh.material = realistic(mat);
      }
    });

    mountPlates(root, spec);

    return { root, paintU, glassU, lampU, paint };
  }, [scene, spec, rig]);

  useEffect(() => {
    return () => {
      built.root.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((mm) => mm.name.startsWith("pwc") && mm.dispose());
        }
      });
    };
  }, [built]);

  const anim = useRef({
    color: new THREE.Color(rig.current?.paint ?? "#b8141f"),
    lastPaint: rig.current?.paint ?? "",
    wipeStart: -1,
    lastSweep: -1,
    first: true,
  });

  useFrame((state, dt) => {
    const r = rig.current;
    if (!r || !inner.current) return;
    const { paintU, glassU, lampU, paint } = built;
    const a = anim.current;
    const now = performance.now();
    const k = r.instant || a.first ? 1 : 1 - Math.exp(-dt * 6);
    const ease = (u: { value: number }, target: number, speed = k) => (u.value += (target - u.value) * speed);

    // car space = the GLB's own scene space, so zones measured from the file apply directly
    built.root.updateWorldMatrix(true, false);
    paintU.uCarInv.value.copy(built.root.matrixWorld).invert();

    // paint: a lit seam wipes new color over old, nose to tail
    if (r.paint !== a.lastPaint) {
      if (a.first || r.instant) {
        paint.color.set(r.paint);
        paintU.uWipeZ.value = -10;
      } else {
        paintU.uPrevColor.value.copy(paint.color);
        paint.color.set(r.paint);
        a.wipeStart = now;
      }
      paint.metalness = r.metallic ? 0.62 : 0.02;
      paint.roughness = r.metallic ? 0.3 : 0.2;
      a.lastPaint = r.paint;
    }
    if (a.wipeStart > 0) {
      const t = Math.min((now - a.wipeStart) / 1100, 1);
      const e = 1 - Math.pow(1 - t, 3);
      const z0 = spec.zones.frontZ + 0.15;
      const z1 = spec.zones.rearZ - 0.15;
      paintU.uWipeZ.value = z0 + (z1 - z0) * e;
      if (t >= 1) {
        a.wipeStart = -1;
        paintU.uWipeZ.value = -10;
      }
    }

    // film
    const f = FINISH[r.finish];
    paintU.uFilm.value = r.film;
    ease(paintU.uFilmMix, r.film > 0 ? 1 : 0);
    ease(paintU.uFilmRough, f.rough);
    ease(paintU.uFilmMetal, f.metal);
    ease(paintU.uFilmCC, f.cc);
    ease(paintU.uFilmCCR, f.ccr);
    ease(paintU.uLines, r.lines);
    paintU.uHover.value = r.hover;
    ease(paintU.uCeramic, r.ceramic);

    // sweep
    if (r.sweepAt !== a.lastSweep && r.sweepAt > 0) a.lastSweep = r.sweepAt;
    if (a.lastSweep > 0) {
      const t = (now - a.lastSweep) / 1600;
      if (t >= 0 && t <= 1) {
        const z0 = spec.zones.frontZ + 0.3;
        const z1 = spec.zones.rearZ - 0.3;
        paintU.uSweepZ.value = z0 + (z1 - z0) * t;
        paintU.uSweepAmt.value = Math.sin(t * Math.PI);
      } else paintU.uSweepAmt.value = 0;
    }

    // glass
    ease(glassU.uFrontDark, r.frontDark);
    ease(glassU.uRearDark, r.rearDark);
    ease(glassU.uWsDark, r.wsDark);
    ease(glassU.uWsStrip, r.wsStrip);
    glassU.uTestStrip.value = r.testStrip;

    // lamps
    ease(lampU.uDrl, r.drl, r.instant || a.first ? 1 : 1 - Math.exp(-dt * 9));
    ease(lampU.uTail, r.tail, r.instant || a.first ? 1 : 1 - Math.exp(-dt * 9));
    lampU.uReveal.value = r.reveal;

    // compare split, in device pixels
    const split = r.split < 0 ? -1 : r.split * state.gl.getPixelRatio();
    paintU.uSplit.value = split;
    glassU.uSplit.value = split;
    paintU.uTime.value = state.clock.elapsedTime;

    a.first = false;
    r.instant = false;
  });

  return (
    <group {...props}>
      <group ref={inner} scale={spec.scale}>
        <primitive object={built.root} position={spec.offset} />
        <group position={spec.offset}>
          <LampGlow spec={spec} rig={rig} />
        </group>
      </group>
    </group>
  );
}

let glowTex: THREE.Texture | null = null;
function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.18, "rgba(255,255,255,0.75)");
  grd.addColorStop(0.45, "rgba(255,255,255,0.22)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
}

/** Lit lamps photograph with a halo and throw light onto the bodywork and the ground. */
function LampGlow({ spec, rig }: { spec: CarSpec; rig: React.RefObject<CarRig> }) {
  const tailMats = useRef<THREE.SpriteMaterial[]>([]);
  const headMats = useRef<THREE.SpriteMaterial[]>([]);
  const tailLights = useRef<THREE.PointLight[]>([]);
  const tex = useMemo(() => glowTexture(), []);
  const make = (color: string) =>
    new THREE.SpriteMaterial({ map: tex, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const tails = useMemo(() => spec.glow.tail.map(() => make("#ff1a2e")), [spec]);
  const band = useMemo(() => (spec.glow.band ? make("#ff1a2e") : null), [spec]);
  const heads = useMemo(() => spec.glow.head.map(() => make("#dfe9ff")), [spec]);
  tailMats.current = [...tails, ...(band ? [band] : [])];
  headMats.current = heads;
  useFrame(() => {
    const r = rig.current;
    if (!r) return;
    const t = r.tail * Math.min(1, r.reveal * 1.6);
    tailMats.current.forEach((m) => (m.opacity = 0.18 * t));
    headMats.current.forEach((m) => (m.opacity = 0.22 * r.drl));
    tailLights.current.forEach((l) => l && (l.intensity = 0.3 * t));
  });
  return (
    <group>
      {spec.glow.tail.map((p, i) => (
        <group key={`t${i}`} position={p}>
          <sprite material={tails[i]} scale={[0.55, 0.22, 1]} />
          <pointLight
            ref={(l) => void (l && (tailLights.current[i] = l))}
            color="#ff1626"
            distance={2.6}
            decay={2}
            position={[0, -0.25, -0.45]}
          />
        </group>
      ))}
      {band && spec.glow.band && <sprite material={band} position={spec.glow.band} scale={[1.1, 0.16, 1]} />}
      {spec.glow.head.map((p, i) => (
        <sprite key={`h${i}`} material={heads[i]} position={p} scale={[0.5, 0.5, 1]} />
      ))}
    </group>
  );
}

export function preloadCar(file: string) {
  useGLTF.preload(file, "/draco/");
}
