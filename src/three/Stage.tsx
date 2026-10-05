"use client";

import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { GroundedSkybox } from "three/examples/jsm/objects/GroundedSkybox.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

export type SceneId = "road" | "warehouse" | "hangar" | "studio" | "night";

export const sceneList: { id: SceneId; name: string; note: string }[] = [
  { id: "road", name: "Country road", note: "Open fields, afternoon sun" },
  { id: "warehouse", name: "Warehouse", note: "Concrete hall under skylights" },
  { id: "hangar", name: "Aircraft hangar", note: "A giant arch opening onto daylight" },
  { id: "studio", name: "Studio", note: "Grey cyclorama, softbox reflections" },
  { id: "night", name: "Night drive", note: "City light streaming over the paint" },
];

/**
 * Photographic scenes. The visible background is the untouched 8k photo (4k on phones), ground-projected so the
 * car stands on the real floor. A small HDR of the same place lights the car and fills its reflections, and a
 * sun is placed at the HDR's brightest point so shadows fall the way the photo says they should.
 */
type PhotoCfg = { bg: string; hdr: string; height: number; radius: number; env: number; soft: number; sun: number; shadow: number; label: string; mb: number; rot: number };
export const PHOTO: Partial<Record<SceneId, PhotoCfg>> = {
  warehouse: { bg: "/scenes/warehouse", hdr: "/scenes/warehouse-1k.hdr", height: 2.6, radius: 70, env: 1.15, soft: 1.0, sun: 1.3, shadow: 0.42, label: "Warehouse", mb: 4, rot: 0 },
  road: { bg: "/scenes/road", hdr: "/scenes/road-1k.hdr", height: 1.75, radius: 110, env: 0.85, soft: 0.5, sun: 2.4, shadow: 0.55, label: "Country road", mb: 39, rot: -Math.PI / 2 },
  hangar: { bg: "/scenes/hangar", hdr: "/scenes/hangar-1k.hdr", height: 2.4, radius: 90, env: 1.0, soft: 0.9, sun: 1.4, shadow: 0.45, label: "Aircraft hangar", mb: 47, rot: 0.9 },
};

function useBigTextures() {
  const gl = useThree((st) => st.gl);
  return useMemo(() => {
    if (typeof window === "undefined") return false;
    const phone = window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;
    return !phone && gl.capabilities.maxTextureSize >= 8192;
  }, [gl]);
}

function PhotoBackdrop({ cfg }: { cfg: PhotoCfg }) {
  const gl = useThree((st) => st.gl);
  const big = useBigTextures();
  // the 4k photo arrives fast; on capable screens the untouched 8k original replaces it once it has streamed in
  const tex = useLoader(THREE.TextureLoader, `${cfg.bg}-4k.jpg`);
  const sky = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = gl.capabilities.getMaxAnisotropy();
    tex.needsUpdate = true;
    const m = new GroundedSkybox(tex, cfg.height, cfg.radius, 160);
    m.position.y = cfg.height - 0.01;
    m.rotation.y = cfg.rot;
    m.renderOrder = -1;
    (m.material as THREE.MeshBasicMaterial).toneMapped = false;
    return m;
  }, [tex, cfg, gl]);
  useEffect(() => {
    if (!big) return;
    let cancelled = false;
    let hi: THREE.Texture | null = null;
    new THREE.TextureLoader().load(`${cfg.bg}-8k.jpg`, (t) => {
      if (cancelled) return t.dispose();
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = gl.capabilities.getMaxAnisotropy();
      const mat = sky.material as THREE.MeshBasicMaterial;
      mat.map = t;
      mat.needsUpdate = true;
      hi = t;
    });
    return () => {
      cancelled = true;
      hi?.dispose();
    };
  }, [big, cfg.bg, sky, gl]);
  useEffect(() => () => sky.geometry.dispose(), [sky]);
  return <primitive object={sky} />;
}

/** Brightest pixel of the HDR, as a world direction (equirect, three's convention). */
function sunDirection(tex: THREE.DataTexture) {
  const { data, width: w, height: h } = tex.image as unknown as { data: Float32Array; width: number; height: number };
  let best = 0;
  let bi = 0;
  for (let i = 0; i < w * h; i++) {
    const l = data[i * 4] * 0.2126 + data[i * 4 + 1] * 0.7152 + data[i * 4 + 2] * 0.0722;
    if (l > best) {
      best = l;
      bi = i;
    }
  }
  const c = bi % w;
  const r = Math.floor(bi / w);
  const u = (c + 0.5) / w;
  const v = 1 - (r + 0.5) / h;
  const lat = (v - 0.5) * Math.PI;
  const lon = (u - 0.5) * Math.PI * 2;
  const dir = new THREE.Vector3(Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon));
  // keep the shadow under the car readable even when the brightest point sits low on the horizon
  if (dir.y < 0.35) dir.y = 0.35;
  return dir.normalize();
}

function PhotoLighting({ cfg }: { cfg: PhotoCfg }) {
  const hdr = useLoader(HDRLoader, cfg.hdr, (l) => l.setDataType(THREE.FloatType)) as THREE.DataTexture;
  const dir = useMemo(() => {
    hdr.mapping = THREE.EquirectangularReflectionMapping; // without this the panorama never becomes reflections
    hdr.needsUpdate = true;
    return sunDirection(hdr).applyAxisAngle(new THREE.Vector3(0, 1, 0), cfg.rot);
  }, [hdr, cfg.rot]);
  const light = useRef<THREE.DirectionalLight>(null!);
  useEffect(() => {
    const l = light.current;
    l.target.position.set(0, 0, 0);
    l.target.updateMatrixWorld();
  }, []);
  return (
    <>
      {/* the place's own light, plus studio softboxes a photographer would bring for clean highlight lines */}
      <Environment map={hdr} environmentIntensity={cfg.env} environmentRotation={[0, cfg.rot, 0]} resolution={512} frames={1}>
        <Lightformer intensity={cfg.soft} rotation-x={Math.PI / 2} position={[0, 7, 0]} scale={[8, 2.5, 1]} />
        <Lightformer intensity={cfg.soft * 1.4} rotation-y={Math.PI / 2} position={[-7, 1.6, 0]} scale={[12, 0.4, 1]} />
        <Lightformer intensity={cfg.soft * 1.4} rotation-y={-Math.PI / 2} position={[7, 1.6, 0]} scale={[12, 0.4, 1]} />
      </Environment>
      <directionalLight
        ref={light}
        position={dir.clone().multiplyScalar(14).toArray()}
        intensity={cfg.sun}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={6}
        shadow-camera-left={-4.5}
        shadow-camera-right={4.5}
        shadow-camera-top={4.5}
        shadow-camera-bottom={-4.5}
        shadow-camera-near={1}
        shadow-camera-far={40}
      />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0]} receiveShadow renderOrder={1}>
        <planeGeometry args={[24, 24]} />
        <shadowMaterial transparent opacity={cfg.shadow} depthWrite={false} />
      </mesh>
      <ContactShadows position={[0, 0.004, 0]} opacity={0.75} scale={10} blur={2.2} far={2.2} resolution={1024} color="#000000" />
      <ContactShadows position={[0, 0.006, 0]} opacity={0.8} scale={6} blur={0.8} far={0.5} resolution={1024} color="#000000" />
    </>
  );
}

/** Cyclorama per light: overhead, the glow at the horizon, the floor's far edge, and the floor itself. */
const ROOM: Partial<Record<SceneId, { top: string; horizon: string; ground: string; floor: string; mirror: number }>> = {
  studio: { top: "#25292f", horizon: "#5c626b", ground: "#41464e", floor: "#3a3e45", mirror: 0.45 },
  night: { top: "#03050a", horizon: "#16244a", ground: "#05070c", floor: "#02040b", mirror: 0.9 },
};

function SkyDome({ top, horizon, ground }: { top: string; horizon: string; ground: string }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          uTop: { value: new THREE.Color(top) },
          uHorizon: { value: new THREE.Color(horizon) },
          uGround: { value: new THREE.Color(ground) },
        },
        vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 uTop, uHorizon, uGround; varying vec3 vDir;
          void main(){
            float y = vDir.y;
            vec3 c = mix(uHorizon, uTop, smoothstep(0.0, 0.5, y));
            c = mix(uGround, c, smoothstep(-0.08, 0.02, y));
            gl_FragColor = vec4(c, 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    [top, horizon, ground]
  );
  return (
    <mesh material={mat} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[45, 48, 24]} />
    </mesh>
  );
}

/** Street lights streaming past, so reflections slide over the paint like a night drive. */
function StreamingLights() {
  const group = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    group.current.position.z += dt * 14;
    if (group.current.position.z > 24) group.current.position.z = -36;
  });
  return (
    <group rotation={[0, 0.35, 0]}>
      <group ref={group}>
        {Array.from({ length: 10 }).map((_, i) => (
          <Lightformer
            key={i}
            form="circle"
            intensity={3}
            color="#ffd9a8"
            rotation={[Math.PI / 2, 0, 0]}
            position={[i % 2 ? 2.5 : -2.5, 4.5, i * 6 - 30]}
            scale={[1.4, 1.4, 1]}
          />
        ))}
      </group>
    </group>
  );
}

/** Pointer position, -1..1, written by the page. Steers a tall softbox so a real highlight slides over the paint. */
export const cursorLight = { x: 0, y: 0 };
function CursorSoftbox() {
  const ref = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    const k = 1 - Math.exp(-dt * 3.5);
    const g = ref.current;
    g.rotation.y += (cursorLight.x * 1.1 - g.rotation.y) * k;
    g.position.y += (cursorLight.y * 1.4 - g.position.y) * k;
  });
  return (
    <group ref={ref}>
      <Lightformer form="rect" intensity={3.2} position={[0, 2.2, 6]} rotation-y={Math.PI} scale={[0.6, 7, 1]} />
      <Lightformer form="rect" intensity={3.2} position={[0, 2.2, -6]} scale={[0.6, 7, 1]} />
    </group>
  );
}

function LightRig({ scene, cursor }: { scene: SceneId; cursor: boolean }) {
  const live = scene === "night" || cursor;
  return (
    <Environment
      files={scene === "night" ? "/hdri/rooftop_night_1k.hdr" : "/hdri/studio_small_09_1k.hdr"}
      resolution={512}
      frames={live ? Infinity : 1}
      environmentIntensity={scene === "night" ? 0.85 : 0.7}
    >
      {scene === "studio" && (
        <>
          <Lightformer intensity={1.6} rotation-x={Math.PI / 2} position={[0, 6, 0]} scale={[10, 3, 1]} />
          <Lightformer intensity={2.6} rotation-y={Math.PI / 2} position={[-6, 1.4, 0]} scale={[14, 0.3, 1]} />
          <Lightformer intensity={2.6} rotation-y={-Math.PI / 2} position={[6, 1.4, 0]} scale={[14, 0.3, 1]} />
        </>
      )}
      {scene === "night" && (
        <>
          <Lightformer intensity={1.8} rotation-y={Math.PI / 2} position={[-7, 0.9, 0]} scale={[24, 0.14, 1]} color="#a9bfff" />
          <Lightformer intensity={1.2} rotation-y={-Math.PI / 2} position={[7, 1.6, 0]} scale={[24, 0.12, 1]} />
          <Lightformer intensity={1.2} color="#2d4a8c" position={[0, 0.6, -14]} scale={[40, 2.2, 1]} />
          <StreamingLights />
        </>
      )}
      {cursor && <CursorSoftbox />}
    </Environment>
  );
}

function Floor({ scene, quality }: { scene: SceneId; quality: "high" | "low" }) {
  const shadows = (
    <>
      <ContactShadows position={[0, 0.004, 0]} opacity={0.9} scale={12} blur={2.6} far={3} resolution={1024} color="#000000" />
      <ContactShadows position={[0, 0.006, 0]} opacity={0.75} scale={6} blur={0.9} far={0.6} resolution={1024} color="#000000" />
    </>
  );
  const r = ROOM[scene];
  if (!r) return shadows;
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[30, 64]} />
        {quality === "high" ? (
          <MeshReflectorMaterial
            color={r.floor}
            mirror={r.mirror}
            roughness={scene === "night" ? 0.7 : 0.85}
            blur={[500, 140]}
            mixBlur={1.1}
            mixStrength={scene === "night" ? 2.2 : 1.1}
            resolution={1024}
            depthScale={0.6}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.3}
            metalness={scene === "night" ? 0.45 : 0.12}
            envMapIntensity={scene === "night" ? 0.15 : 0.6}
          />
        ) : (
          <meshStandardMaterial color={r.floor} roughness={0.75} metalness={0.1} />
        )}
      </mesh>
      {shadows}
    </>
  );
}

export function Stage({ scene, quality = "high", cursor = false }: { scene: SceneId; quality?: "high" | "low"; cursor?: boolean }) {
  const photo = PHOTO[scene];
  if (photo)
    return (
      <>
        <color attach="background" args={["#14171c"]} />
        <Suspense fallback={null}>
          <PhotoLighting cfg={photo} />
          <PhotoBackdrop cfg={photo} />
        </Suspense>
      </>
    );
  const room = ROOM[scene]!;
  return (
    <>
      <color attach="background" args={[room.horizon]} />
      <SkyDome top={room.top} horizon={room.horizon} ground={room.ground} />
      <fog attach="fog" args={[room.horizon, scene === "night" ? 11 : 13, 28]} />
      <LightRig scene={scene} cursor={cursor} />
      <Floor scene={scene} quality={quality} />
    </>
  );
}

export function Effects({ bloom = 0.35, quality = "high" }: { bloom?: number; quality?: "high" | "low" }) {
  return (
    <EffectComposer multisampling={quality === "high" ? 4 : 0} enableNormalPass={false}>
      {quality === "high" ? <N8AO aoRadius={0.55} intensity={2.4} distanceFalloff={0.8} halfRes quality="medium" /> : <></>}
      <Bloom mipmapBlur intensity={bloom} luminanceThreshold={1.15} luminanceSmoothing={0.15} radius={0.6} />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      <Vignette offset={0.35} darkness={0.45} />
    </EffectComposer>
  );
}
