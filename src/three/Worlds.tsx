"use client";

import * as THREE from "three";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";

/**
 * Real 3D environments the visitor can orbit all the way around. Geometry is built here; the surfaces
 * are seamless textures generated with Higgsfield (pavers, polished concrete, white brick).
 */

function useTiled(url: string, repeat: [number, number]) {
  const gl = useThree((s) => s.gl);
  const base = useLoader(THREE.TextureLoader, url);
  return useMemo(() => {
    const t = base.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repeat);
    t.anisotropy = gl.capabilities.getMaxAnisotropy();
    t.needsUpdate = true;
    return t;
  }, [base, repeat, gl]);
}

function DaySky({ top = "#5f98d6", horizon = "#dbe8f3" }: { top?: string; horizon?: string }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { uTop: { value: new THREE.Color(top) }, uHorizon: { value: new THREE.Color(horizon) } },
        vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 uTop, uHorizon; varying vec3 vDir;
          void main(){ float y = max(vDir.y, 0.0); vec3 c = mix(uHorizon, uTop, pow(smoothstep(0.0, 0.6, y), 0.8)); gl_FragColor = vec4(c,1.0);
          #include <colorspace_fragment>
          }`,
      }),
    [top, horizon]
  );
  return (
    <mesh material={mat} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[120, 48, 24]} />
    </mesh>
  );
}

function Sun({ position, intensity, color = "#fff4e6" }: { position: [number, number, number]; intensity: number; color?: string }) {
  const light = useRef<THREE.DirectionalLight>(null!);
  useLayoutEffect(() => {
    light.current.target.position.set(0, 0, 0);
    light.current.target.updateMatrixWorld();
  }, []);
  return (
    <directionalLight
      ref={light}
      position={position}
      intensity={intensity}
      color={color}
      castShadow
      shadow-mapSize={[4096, 4096]}
      shadow-bias={-0.0003}
      shadow-normalBias={0.02}
      shadow-radius={5}
      shadow-camera-left={-16}
      shadow-camera-right={16}
      shadow-camera-top={16}
      shadow-camera-bottom={-16}
      shadow-camera-near={1}
      shadow-camera-far={70}
    />
  );
}

/** A walled courtyard: white brick walls with deep slatted bays, concrete pavers, open sky, real sun shadows. */
export function Courtyard3D() {
  const hdr = useLoader(HDRLoader, "/scenes/road-1k.hdr") as THREE.DataTexture;
  useMemo(() => void (hdr.mapping = THREE.EquirectangularReflectionMapping), [hdr]);
  const size = 26;
  const h = 4.6;
  const pavers = useTiled("/textures/pavers.jpg", [size / 2, size / 2]);
  const brickA = useTiled("/textures/brick.jpg", [size / 2.2, h / 2.2]);
  const brickMat = useMemo(() => new THREE.MeshStandardMaterial({ map: brickA, roughness: 0.92, color: "#f3f1ec" }), [brickA]);
  const finMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d8d5ce", roughness: 0.8 }), []);
  const recessMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#b9b6af", roughness: 0.9 }), []);

  // slatted bays along each wall: a recessed panel with five vertical fins
  const fins = useMemo(() => {
    const out: { pos: [number, number, number]; rotY: number }[] = [];
    const bays: { pos: [number, number, number]; rotY: number }[] = [];
    const half = size / 2;
    const walls = [
      { z: -half + 0.01, rot: 0, axis: "x" as const },
      { z: half - 0.01, rot: Math.PI, axis: "x" as const },
      { x: -half + 0.01, rot: Math.PI / 2, axis: "z" as const },
      { x: half - 0.01, rot: -Math.PI / 2, axis: "z" as const },
    ];
    for (const w of walls) {
      for (let t = -half + 3; t <= half - 3; t += 4.2) {
        const bx = w.axis === "x" ? t : (w.x as number);
        const bz = w.axis === "x" ? (w.z as number) : t;
        bays.push({ pos: [bx, h * 0.47, bz], rotY: w.rot });
        for (let i = -2; i <= 2; i++) {
          const off = i * 0.26;
          const fx = w.axis === "x" ? t + off : (w.x as number);
          const fz = w.axis === "x" ? (w.z as number) : t + off;
          out.push({ pos: [fx, h * 0.47, fz], rotY: w.rot });
        }
      }
    }
    return { fins: out, bays };
  }, []);

  const finRef = useRef<THREE.InstancedMesh>(null!);
  const bayRef = useRef<THREE.InstancedMesh>(null!);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const sc = new THREE.Vector3(1, 1, 1);
    fins.fins.forEach((f, i) => {
      e.set(0, f.rotY, 0);
      q.setFromEuler(e);
      // push fins slightly out from the wall face
      const n = new THREE.Vector3(0, 0, 1).applyQuaternion(q).multiplyScalar(0.14);
      m.compose(new THREE.Vector3(...f.pos).add(n), q, sc);
      finRef.current.setMatrixAt(i, m);
    });
    finRef.current.instanceMatrix.needsUpdate = true;
    fins.bays.forEach((b, i) => {
      e.set(0, b.rotY, 0);
      q.setFromEuler(e);
      const n = new THREE.Vector3(0, 0, 1).applyQuaternion(q).multiplyScalar(0.02);
      m.compose(new THREE.Vector3(...b.pos).add(n), q, sc);
      bayRef.current.setMatrixAt(i, m);
    });
    bayRef.current.instanceMatrix.needsUpdate = true;
  }, [fins]);

  const half = size / 2;
  return (
    <>
      <color attach="background" args={["#dbe8f3"]} />
      <DaySky />
      <Environment map={hdr} environmentIntensity={0.9} resolution={512} frames={1}>
        <Lightformer intensity={0.6} rotation-x={Math.PI / 2} position={[0, 7, 0]} scale={[8, 2.5, 1]} />
      </Environment>
      <Sun position={[-9, 12, -6]} intensity={2.6} />
      <hemisphereLight args={["#dbe8f3", "#a8a49c", 0.25]} />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial map={pavers} roughness={0.85} metalness={0} color="#e9e8e4" />
      </mesh>
      {/* walls */}
      {[
        { p: [0, h / 2, -half - 0.15], r: 0, w: size + 0.6 },
        { p: [0, h / 2, half + 0.15], r: Math.PI, w: size + 0.6 },
        { p: [-half - 0.15, h / 2, 0], r: Math.PI / 2, w: size + 0.6 },
        { p: [half + 0.15, h / 2, 0], r: -Math.PI / 2, w: size + 0.6 },
      ].map((w, i) => (
        <group key={i}>
          <mesh position={w.p as [number, number, number]} rotation-y={w.r} material={brickMat} castShadow receiveShadow>
            <boxGeometry args={[w.w, h, 0.3]} />
          </mesh>
          <mesh position={[w.p[0], h + 0.12, w.p[2]]} rotation-y={w.r} castShadow>
            <boxGeometry args={[w.w + 0.2, 0.24, 0.5]} />
            <meshStandardMaterial color="#ecebe6" roughness={0.85} />
          </mesh>
        </group>
      ))}
      <instancedMesh ref={bayRef} args={[undefined, undefined, fins.bays.length]} material={recessMat} receiveShadow>
        <boxGeometry args={[1.45, h * 0.86, 0.04]} />
      </instancedMesh>
      <instancedMesh ref={finRef} args={[undefined, undefined, fins.fins.length]} material={finMat} castShadow receiveShadow>
        <boxGeometry args={[0.1, h * 0.86, 0.26]} />
      </instancedMesh>
      <ContactShadows position={[0, 0.005, 0]} opacity={0.65} scale={9} blur={2.4} far={2.2} resolution={1024} color="#000000" />
      <ContactShadows position={[0, 0.007, 0]} opacity={0.8} scale={6} blur={0.8} far={0.5} resolution={1024} color="#000000" />
    </>
  );
}

/** A glass-walled showroom: polished concrete floor, LED strip ceiling, charcoal accent wall. */
export function Showroom3D({ quality }: { quality: "high" | "low" }) {
  const W = 26;
  const D = 20;
  const H = 6;
  const concrete = useTiled("/textures/concrete.jpg", [W / 4, D / 4]);
  const glassMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#dfe8ee", roughness: 0.02, metalness: 0, transparent: true, opacity: 0.18, envMapIntensity: 1.4, depthWrite: false }),
    []
  );
  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1d2024", roughness: 0.4, metalness: 0.6 }), []);
  const ledMat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 3.2, 3.4), toneMapped: false }), []);
  const strips = [-6, -2, 2, 6];
  const mullions = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let x = -W / 2; x <= W / 2; x += 2.6) out.push([x, H / 2, -D / 2]);
    for (let z = -D / 2 + 2.5; z <= D / 2; z += 2.5) out.push([W / 2, H / 2, z]);
    for (let x = -W / 2; x <= W / 2; x += 2.6) out.push([x, H / 2, D / 2]);
    return out;
  }, []);
  return (
    <>
      <color attach="background" args={["#e9eef2"]} />
      <DaySky top="#bccbd8" horizon="#f2f5f7" />
      <Environment resolution={512} frames={1} environmentIntensity={1}>
        <color attach="background" args={["#4b5058"]} />
        {strips.map((x) => (
          <Lightformer key={x} intensity={2.4} rotation-x={Math.PI / 2} position={[x, 5.6, 0]} scale={[0.25, 18, 1]} />
        ))}
        <Lightformer intensity={2.2} position={[0, 3, -10]} scale={[26, 5, 1]} color="#f4f8fb" />
        <Lightformer intensity={1.8} rotation-y={-Math.PI / 2} position={[13, 3, 0]} scale={[20, 5, 1]} color="#f4f8fb" />
        <Lightformer intensity={1.6} rotation-y={Math.PI} position={[0, 3, 10]} scale={[26, 5, 1]} color="#f4f8fb" />
        <Lightformer intensity={0.25} rotation-y={Math.PI / 2} position={[-13, 3, 0]} scale={[20, 5, 1]} color="#2a2d33" />
      </Environment>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 10, 4]} intensity={0.9} castShadow shadow-mapSize={[2048, 2048]} shadow-radius={10} shadow-bias={-0.0004}>
        <orthographicCamera attach="shadow-camera" args={[-8, 8, 8, -8, 1, 30]} />
      </directionalLight>
      {/* floor */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[W, D]} />
        {quality === "high" ? (
          <MeshReflectorMaterial
            map={concrete}
            color="#d6d8da"
            mirror={0.55}
            roughness={0.35}
            metalness={0.05}
            blur={[400, 100]}
            mixBlur={0.9}
            mixStrength={1.2}
            resolution={1024}
            depthScale={0.5}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.2}
          />
        ) : (
          <meshStandardMaterial map={concrete} color="#d6d8da" roughness={0.35} />
        )}
      </mesh>
      {/* ceiling with LED strips */}
      <mesh rotation-x={Math.PI / 2} position={[0, H, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#f4f4f2" roughness={0.9} />
      </mesh>
      {strips.map((x) => (
        <mesh key={x} position={[x, H - 0.02, 0]} material={ledMat}>
          <boxGeometry args={[0.12, 0.02, D - 2]} />
        </mesh>
      ))}
      {/* charcoal accent wall */}
      <mesh position={[-W / 2, H / 2, 0]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial color="#26292e" roughness={0.75} />
      </mesh>
      {/* glass curtain walls */}
      <mesh position={[0, H / 2, -D / 2]} material={glassMat}>
        <planeGeometry args={[W, H]} />
      </mesh>
      <mesh position={[W / 2, H / 2, 0]} rotation-y={-Math.PI / 2} material={glassMat}>
        <planeGeometry args={[D, H]} />
      </mesh>
      <mesh position={[0, H / 2, D / 2]} rotation-y={Math.PI} material={glassMat}>
        <planeGeometry args={[W, H]} />
      </mesh>
      {mullions.map((p, i) => (
        <mesh key={i} position={p} material={frameMat}>
          <boxGeometry args={[0.08, H, 0.08]} />
        </mesh>
      ))}
      <ContactShadows position={[0, 0.005, 0]} opacity={0.7} scale={9} blur={2.4} far={2.2} resolution={1024} color="#000000" />
      <ContactShadows position={[0, 0.007, 0]} opacity={0.85} scale={6} blur={0.8} far={0.5} resolution={1024} color="#000000" />
    </>
  );
}
