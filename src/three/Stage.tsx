"use client";

import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

export type SceneId = "architecture" | "courtyard" | "showroom" | "bigsur" | "diablo" | "studio" | "night";

export const sceneList: { id: SceneId; name: string; note: string }[] = [
  { id: "architecture", name: "Architecture", note: "Slatted wall, concrete plaza, afternoon sun" },
  { id: "courtyard", name: "Courtyard", note: "Ivy wall over brick pavers" },
  { id: "showroom", name: "Showroom", note: "Glass walls, polished floor" },
  { id: "bigsur", name: "Big Sur", note: "Coastal overlook at golden hour" },
  { id: "diablo", name: "Mount Diablo", note: "Golden hills at sunset, just up the road" },
  { id: "studio", name: "Studio", note: "Grey cyclorama, softbox reflections" },
  { id: "night", name: "Night drive", note: "City light streaming over the paint" },
];

/**
 * Backplate scenes: purpose-made, eye-level location photos (generated with Higgsfield for this site).
 * The photo fills the frame behind the car, the camera holds the photo's eye level so the floor lines up,
 * and a sun matched to the photo casts real shadows onto its floor through an invisible shadow catcher.
 */
export type PlateCfg = {
  img: string;
  horizon: number; // photo's eye-level horizon, fraction from the top
  floor: number; // where the car stands in the photo, fraction from the top
  dist: number; // camera distance to the car
  env: string; // HDR that lights the car and fills reflections
  envI: number;
  sun: [number, number, number];
  sunI: number;
  sunColor: string;
  shadow: number;
  soft: number;
};

export const PLATES: Partial<Record<SceneId, PlateCfg>> = {
  architecture: { img: "/scenes/plates/architecture", horizon: 0.47, floor: 0.7, dist: 8.2, env: "/scenes/road-1k.hdr", envI: 0.9, sun: [-6, 7, -4], sunI: 2.2, sunColor: "#fff3e2", shadow: 0.42, soft: 0.6 },
  courtyard: { img: "/scenes/plates/courtyard", horizon: 0.5, floor: 0.76, dist: 8.2, env: "/scenes/road-1k.hdr", envI: 0.95, sun: [-6, 9, -3], sunI: 2.4, sunColor: "#fff6e8", shadow: 0.45, soft: 0.55 },
  showroom: { img: "/scenes/plates/showroom", horizon: 0.47, floor: 0.72, dist: 8.4, env: "/hdri/studio_small_09_1k.hdr", envI: 0.85, sun: [2, 10, 4], sunI: 1.1, sunColor: "#ffffff", shadow: 0.35, soft: 1.2 },
  bigsur: { img: "/scenes/plates/bigsur", horizon: 0.42, floor: 0.72, dist: 8.0, env: "/scenes/road-1k.hdr", envI: 0.8, sun: [7, 3.5, -6], sunI: 2.0, sunColor: "#ffd2a0", shadow: 0.5, soft: 0.45 },
  diablo: { img: "/scenes/plates/diablo", horizon: 0.32, floor: 0.72, dist: 8.0, env: "/scenes/road-1k.hdr", envI: 0.75, sun: [-7, 3, -6], sunI: 1.8, sunColor: "#ffbf80", shadow: 0.5, soft: 0.4 },
};

/**
 * The photo as a full-frame backdrop, re-fitted every frame so two lines agree with the 3D camera:
 * the photo's horizon sits on the camera's horizon, and the photo's floor point sits exactly where
 * the car meets the ground. The car therefore always stands on the photographed floor.
 */
function PlateBackground({ cfg }: { cfg: PlateCfg }) {
  const scene = useThree((st) => st.scene);
  const gl = useThree((st) => st.gl);
  const phone = useMemo(() => typeof window !== "undefined" && window.matchMedia("(max-width: 900px), (pointer: coarse)").matches, []);
  const tex = useLoader(THREE.TextureLoader, `${cfg.img}-${phone ? "2k" : "4k"}.jpg`);
  const tmp = useMemo(() => ({ dir: new THREE.Vector3(), far: new THREE.Vector3(), contact: new THREE.Vector3() }), []);
  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = gl.capabilities.getMaxAnisotropy();
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    const prev = scene.background;
    scene.background = tex;
    return () => {
      scene.background = prev;
    };
  }, [tex, scene, gl]);
  useFrame(({ camera, size }) => {
    const img = tex.image as { width: number; height: number } | undefined;
    if (!img?.width) return;
    const toTop = (ndcY: number) => (1 - ndcY) / 2;
    // camera horizon: a far point straight ahead at eye height
    camera.getWorldDirection(tmp.dir);
    tmp.dir.y = 0;
    tmp.dir.normalize();
    tmp.far.copy(camera.position).addScaledVector(tmp.dir, 2000).project(camera);
    const hS = toTop(tmp.far.y);
    // where the car touches the ground
    tmp.contact.set(0, 0, 0).project(camera);
    const cS = toTop(tmp.contact.y);
    // linear map from photo rows to screen rows: floor line exact, horizon as close as the photo allows
    const canvasAspect = size.width / size.height;
    const imgAspect = img.width / img.height;
    const ideal = (cfg.floor - cfg.horizon) / Math.max(0.05, cS - hS); // visible photo height for a perfect horizon
    const ry = Math.min(
      ideal,
      (1 - cfg.floor) / Math.max(0.02, 1 - cS), // never run past the photo's bottom edge
      cfg.floor / Math.max(0.02, cS), // or its top edge
      imgAspect / canvasAspect // or its sides
    );
    const rx = (ry * canvasAspect) / imgAspect;
    const oy = 1 - cfg.floor - ry * (1 - cS);
    const ox = (1 - rx) / 2;
    tex.repeat.set(rx, ry);
    tex.offset.set(ox, oy);
  });
  return null;
}

/** Downward pitch for a plate scene: a photographer standing at eye level. */
export function platePitch(_cfg: PlateCfg) {
  return THREE.MathUtils.degToRad(5);
}

function PlateLighting({ cfg }: { cfg: PlateCfg }) {
  const hdr = useLoader(HDRLoader, cfg.env) as THREE.DataTexture;
  useMemo(() => {
    hdr.mapping = THREE.EquirectangularReflectionMapping;
  }, [hdr]);
  const light = useRef<THREE.DirectionalLight>(null!);
  useEffect(() => {
    light.current.target.position.set(0, 0, 0);
    light.current.target.updateMatrixWorld();
  }, []);
  return (
    <>
      <Environment map={hdr} environmentIntensity={cfg.envI} resolution={512} frames={1}>
        <Lightformer intensity={cfg.soft} rotation-x={Math.PI / 2} position={[0, 7, 0]} scale={[8, 2.5, 1]} />
        <Lightformer intensity={cfg.soft * 1.3} rotation-y={Math.PI / 2} position={[-7, 1.6, 0]} scale={[12, 0.4, 1]} />
        <Lightformer intensity={cfg.soft * 1.3} rotation-y={-Math.PI / 2} position={[7, 1.6, 0]} scale={[12, 0.4, 1]} />
      </Environment>
      <directionalLight
        ref={light}
        position={cfg.sun}
        intensity={cfg.sunI}
        color={cfg.sunColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={8}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
      />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0]} receiveShadow renderOrder={1}>
        <planeGeometry args={[30, 30]} />
        <shadowMaterial transparent opacity={cfg.shadow} depthWrite={false} />
      </mesh>
      <ContactShadows position={[0, 0.004, 0]} opacity={0.7} scale={10} blur={2.4} far={2.2} resolution={1024} color="#000000" />
      <ContactShadows position={[0, 0.006, 0]} opacity={0.85} scale={6} blur={0.8} far={0.5} resolution={1024} color="#000000" />
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
  const plate = PLATES[scene];
  if (plate)
    return (
      <>
        <color attach="background" args={["#14171c"]} />
        <Suspense fallback={null}>
          <PlateLighting cfg={plate} />
          <PlateBackground cfg={plate} />
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
