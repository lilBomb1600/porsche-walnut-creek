"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

export type SceneId = "architecture" | "track" | "servicebay" | "driveway" | "studio" | "bay" | "night";

export const sceneList: { id: SceneId; name: string; note: string }[] = [
  { id: "architecture", name: "Architecture", note: "Concrete plaza, glass and columns" },
  { id: "track", name: "Race track", note: "Afternoon sun on the pit straight" },
  { id: "servicebay", name: "Service bay", note: "A real workshop, lift and all" },
  { id: "driveway", name: "Home driveway", note: "Golden hour, where it'll live" },
  { id: "studio", name: "Studio", note: "Grey cyclorama, softbox reflections" },
  { id: "bay", name: "Detail bay", note: "Hex LED ceiling, where film goes on" },
  { id: "night", name: "Night drive", note: "City light streaming over the paint" },
];

/** Photographic 360° environments the car sits inside: real ground under the tires, real reflections in the paint. */
const PHOTO: Partial<Record<SceneId, { file: string; height: number; radius: number; scale: number; intensity: number; rotation?: number }>> = {
  architecture: { file: "/hdri/modern_buildings_2_2k.hdr", height: 2.2, radius: 60, scale: 220, intensity: 1, rotation: 0.6 },
  track: { file: "/hdri/zwartkops_straight_afternoon_2k.hdr", height: 1.9, radius: 90, scale: 260, intensity: 0.95, rotation: 1.2 },
  servicebay: { file: "/hdri/autoshop_01_2k.hdr", height: 2.6, radius: 40, scale: 200, intensity: 1.1, rotation: 0 },
  driveway: { file: "/hdri/suburban_parking_area_2k.hdr", height: 1.9, radius: 60, scale: 220, intensity: 1, rotation: 2.4 },
};

/** Cyclorama per light: overhead, the glow at the horizon, the floor's far edge, and the floor itself. */
const ROOM: Partial<Record<SceneId, { top: string; horizon: string; ground: string; floor: string; mirror: number }>> = {
  studio: { top: "#25292f", horizon: "#5c626b", ground: "#41464e", floor: "#3a3e45", mirror: 0.45 },
  bay: { top: "#1b1e23", horizon: "#3a3f47", ground: "#2e3238", floor: "#33373e", mirror: 0.5 },
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

/** Hexagonal LED tube ceiling, the signature light of every paint-protection bay. */
function HexCeiling({ intensity = 2.2, y = 4.2, cells = 4, size = 1.15 }) {
  const tubes = useMemo(() => {
    const out: { pos: [number, number, number]; rot: number }[] = [];
    const w = Math.sqrt(3) * size;
    const seen = new Set<string>();
    for (let q = -cells; q <= cells; q++) {
      for (let r = -cells; r <= cells; r++) {
        const cx = w * (q + r / 2);
        const cz = 1.5 * size * r;
        if (Math.hypot(cx, cz) > cells * 1.6 * size) continue;
        for (let i = 0; i < 6; i++) {
          const a0 = (Math.PI / 3) * i + Math.PI / 6;
          const a1 = a0 + Math.PI / 3;
          const x0 = cx + size * Math.cos(a0), z0 = cz + size * Math.sin(a0);
          const x1 = cx + size * Math.cos(a1), z1 = cz + size * Math.sin(a1);
          const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
          const key = `${mx.toFixed(2)},${mz.toFixed(2)}`;
          if (seen.has(key)) continue;
          seen.add(key);
          out.push({ pos: [mx, y, mz], rot: Math.atan2(z1 - z0, x1 - x0) });
        }
      }
    }
    return out;
  }, [cells, size, y]);
  return (
    <group>
      {tubes.map((t, i) => (
        <Lightformer key={i} form="rect" intensity={intensity} position={t.pos} rotation={[Math.PI / 2, 0, -t.rot]} scale={[size * 0.96, 0.07, 1]} />
      ))}
    </group>
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
  const photo = PHOTO[scene];
  if (photo)
    return (
      <Environment
        files={photo.file}
        background
        ground={{ height: photo.height, radius: photo.radius, scale: photo.scale }}
        environmentIntensity={photo.intensity}
        environmentRotation={[0, photo.rotation ?? 0, 0]}
        backgroundRotation={[0, photo.rotation ?? 0, 0]}
      />
    );

  const live = scene === "night" || cursor;
  return (
    <Environment
      files={scene === "night" ? "/hdri/rooftop_night_1k.hdr" : "/hdri/studio_small_09_1k.hdr"}
      resolution={512}
      frames={live ? Infinity : 1}
      environmentIntensity={scene === "night" ? 0.85 : scene === "bay" ? 0.5 : 0.7}
    >
      {scene === "studio" && (
        <>
          <Lightformer intensity={1.6} rotation-x={Math.PI / 2} position={[0, 6, 0]} scale={[10, 3, 1]} />
          <Lightformer intensity={2.6} rotation-y={Math.PI / 2} position={[-6, 1.4, 0]} scale={[14, 0.3, 1]} />
          <Lightformer intensity={2.6} rotation-y={-Math.PI / 2} position={[6, 1.4, 0]} scale={[14, 0.3, 1]} />
        </>
      )}
      {scene === "bay" && <HexCeiling />}
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
  const room = ROOM[scene] ?? null;
  return (
    <>
      <color attach="background" args={[room ? room.horizon : "#8a929c"]} />
      {room && <SkyDome top={room.top} horizon={room.horizon} ground={room.ground} />}
      {room && <fog attach="fog" args={[room.horizon, scene === "night" ? 11 : 13, 28]} />}
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
