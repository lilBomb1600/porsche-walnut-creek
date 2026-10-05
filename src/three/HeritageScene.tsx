"use client";

import * as THREE from "three";
import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CarModel, defaultRig, type CarRig } from "./CarModel";
import { Effects, Stage } from "./Stage";
import { carById } from "@/data/cars";
import { paintById } from "@/data/paints";

function Turntable({ children }: { children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null!);
  const reduced = useRef(typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useFrame((_, dt) => {
    if (!reduced.current) g.current.rotation.y += dt * 0.12;
  });
  return (
    <group ref={g} rotation={[0, 2.5, 0]}>
      {children}
    </group>
  );
}

/** Pull the camera back as the canvas narrows so the whole car stays in frame. */
function FitCamera() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const dir = useRef(new THREE.Vector3(5.6, 1.1, -5.4).normalize());
  useFrame(() => {
    const aspect = size.width / size.height;
    const d = 9.4 * Math.max(1, 1.35 / aspect);
    camera.position.copy(dir.current).multiplyScalar(d);
    camera.position.y = 1.5;
    camera.lookAt(0, 0.6, 0);
  });
  return null;
}

export default function HeritageScene({ active }: { active: boolean }) {
  const spec = carById("930");
  const rig = useRef<CarRig>(defaultRig({ paint: paintById("guards-red").hex, drl: 1, tail: 1, reveal: 1 }));
  return (
    <Canvas
      shadows
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.5]}
      camera={{ position: [5.6, 1.5, -5.4], fov: 28, near: 0.1, far: 60 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      onCreated={({ gl, camera }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        camera.lookAt(0, 0.55, 0);
      }}
      aria-hidden
    >
      <FitCamera />
      <Suspense fallback={null}>
        <Stage scene="night" quality="low" />
        <Turntable>
          <CarModel spec={spec} rig={rig} />
        </Turntable>
        <Effects quality="low" bloom={0.7} />
      </Suspense>
    </Canvas>
  );
}
