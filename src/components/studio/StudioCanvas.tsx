"use client";

import * as THREE from "three";
import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CameraControls, PerformanceMonitor, useProgress } from "@react-three/drei";
import { CarModel, defaultRig, type CarRig } from "@/three/CarModel";
import { Effects, PHOTO, Stage } from "@/three/Stage";
import { vltToDark } from "@/three/materials";
import { carById } from "@/data/cars";
import { paintById } from "@/data/paints";
import { useStudio, type ViewId } from "@/lib/studio-store";
import { CoveragePins } from "./CoveragePins";
import { FourPoints } from "@/components/ui/FourPoints";

const VIEWS: Record<ViewId, { pos: [number, number, number]; target: [number, number, number] }> = {
  orbit: { pos: [5.4, 1.75, 6.4], target: [0, 0.55, 0] },
  front: { pos: [3.1, 1.45, 5.6], target: [0, 0.5, 0.7] },
  side: { pos: [7.6, 1.15, 0.2], target: [0, 0.6, 0] },
  rear: { pos: [-2.8, 1.4, -6.2], target: [0, 0.55, -0.3] },
  top: { pos: [0.01, 10.5, 0.3], target: [0, 0, 0] },
};

function RigSync({ rig }: { rig: React.RefObject<CarRig> }) {
  const width = useThree((s) => s.size.width);
  const widthRef = useRef(width);
  widthRef.current = width;
  useEffect(() => {
    const apply = (s: ReturnType<typeof useStudio.getState>) => {
      const r = rig.current;
      const p = paintById(s.paint);
      r.paint = p.hex;
      r.metallic = !!p.metallic;
      r.film = s.film;
      r.finish = s.finish;
      r.lines = s.showLines && (s.step === "film" || s.step === "review") ? 1 : 0;
      r.hover = s.step === "film" ? s.hoverTier : -1;
      r.frontDark = vltToDark(s.front);
      r.rearDark = vltToDark(s.rear);
      r.wsDark = s.windshield === "clear70" ? 0.16 : 0;
      r.wsStrip = s.windshield === "strip" ? 1 : 0;
      r.testStrip = s.testStrip ? 1 : 0;
      r.ceramic = s.ceramic > 0 ? 0.55 + s.ceramic / 16 : 0;
      const lit = s.scene === "night" || s.scene === "studio";
      r.drl = lit ? 1 : 0.7;
      r.tail = lit ? 1 : 0.35;
      r.reveal = 1;
      r.split = s.compare ? s.split * widthRef.current : -1;
      r.sweepAt = s.sweepAt;
    };
    apply(useStudio.getState());
    return useStudio.subscribe(apply);
  }, [rig]);
  useEffect(() => {
    const s = useStudio.getState();
    if (s.compare) rig.current.split = s.split * width;
  }, [width, rig]);
  return null;
}

function CameraRig() {
  const ref = useRef<CameraControls>(null!);
  const view = useStudio((s) => s.view);
  const nonce = useStudio((s) => s.viewNonce);
  const size = useThree((s) => s.size);
  const reduced = useRef(false);
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
  // pull back on narrow stages so the whole car stays in frame
  const fit = Math.max(1, 1.1 / (size.width / Math.max(1, size.height)));
  useEffect(() => {
    const v = VIEWS[view];
    const t = new THREE.Vector3(...v.target);
    const p = new THREE.Vector3(...v.pos).sub(t).multiplyScalar(view === "top" ? Math.max(1, fit * 0.85) : fit).add(t);
    ref.current?.setLookAt(p.x, p.y, p.z, t.x, t.y, t.z, !reduced.current);
  }, [view, nonce, fit]);
  return (
    <CameraControls
      ref={ref}
      makeDefault
      minDistance={3.2}
      maxDistance={22}
      maxPolarAngle={Math.PI / 2 - 0.04}
      smoothTime={0.55}
      draggingSmoothTime={0.12}
      truckSpeed={0}
    />
  );
}

/** Fires once the car has rendered its first frame (Suspense resolved). */
export function ReadySignal({ onReady }: { onReady: () => void }) {
  const fired = useRef(false);
  useFrame(() => {
    if (!fired.current) {
      fired.current = true;
      requestAnimationFrame(onReady);
    }
  });
  return null;
}

export function StudioLoader({ ready }: { ready: boolean }) {
  const { progress } = useProgress();
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (ready) {
      const t = setTimeout(() => setGone(true), 700);
      return () => clearTimeout(t);
    }
  }, [ready]);
  if (gone) return null;
  const lit = ready ? 4 : Math.min(3, Math.floor(progress / 25));
  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-night transition-opacity duration-500"
      style={{ opacity: ready ? 0 : 1 }}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-5">
        <FourPoints lit={lit} />
        <p className="tnum text-sm text-drl-dim">Warming up the lights · {ready ? 100 : Math.round(progress)}%</p>
      </div>
    </div>
  );
}

/** While a new background streams in, the car stays put and a small chip reports progress. */
function SceneLoading({ ready }: { ready: boolean }) {
  const { active, progress } = useProgress();
  const scene = useStudio((s) => s.scene);
  const cfg = PHOTO[scene];
  if (!ready || !active || !cfg) return null;
  return (
    <div className="glass pointer-events-none absolute left-1/2 top-6 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full px-4 py-2 text-[13px] font-medium text-white" role="status">
      <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      Loading {cfg.label} · {Math.round(progress)}%
    </div>
  );
}

export default function StudioCanvas() {
  const carId = useStudio((s) => s.car);
  const scene = useStudio((s) => s.scene);
  const spec = carById(carId);
  const rig = useRef<CarRig>(defaultRig());
  const [quality, setQuality] = useState<"high" | "low">("high");
  const [ready, setReady] = useState(false);

  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        dpr={quality === "high" ? [1, 1.75] : [1, 1.1]}
        camera={{ position: VIEWS.orbit.pos, fov: 30, near: 0.1, far: 600 }}
        gl={{ antialias: false, powerPreference: "high-performance", preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <PerformanceMonitor onDecline={() => setQuality("low")} />
        <Suspense fallback={null}>
          <Stage scene={scene} quality={quality} />
          <CarModel key={spec.id} spec={spec} rig={rig} />
          <CoveragePins spec={spec} />
          <Effects quality={quality} bloom={scene === "night" ? 0.75 : scene === "studio" ? 0.3 : 0.2} />
          <ReadySignal onReady={() => setReady(true)} />
        </Suspense>
        <RigSync rig={rig} />
        <CameraRig />
      </Canvas>
      <StudioLoader ready={ready} />
      <SceneLoading ready={ready} />
    </div>
  );
}
