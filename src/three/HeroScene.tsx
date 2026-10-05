"use client";

import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { CarModel, defaultRig, type CarRig } from "./CarModel";
import { Effects, Stage } from "./Stage";
import { vltToDark } from "./materials";
import { carById } from "@/data/cars";
import { paintById } from "@/data/paints";
import { INTRO_MS, beats, easeInOutCubic, range, smooth, story } from "@/lib/story";

type Key = { p: number; pos: [number, number, number]; tgt: [number, number, number] };

// Scroll camera path. The car faces +z; the camera works the car's right flank (-x).
const KEYS: Key[] = [
  { p: 0.0, pos: [0, 1.02, -6.9], tgt: [0, 0.52, -0.2] },
  { p: 0.11, pos: [-7.2, 1.35, 0.6], tgt: [0, 0.5, 0.15] },
  { p: 0.31, pos: [-6.7, 1.15, -1.0], tgt: [0, 0.52, 0] },
  { p: 0.37, pos: [-3.5, 1.5, 5.3], tgt: [0, 0.42, 0.85] },
  { p: 0.53, pos: [-2.3, 1.95, 5.8], tgt: [0, 0.42, 0.7] },
  { p: 0.59, pos: [-6.4, 1.05, -0.25], tgt: [0, 0.6, -0.15] },
  { p: 0.73, pos: [-6.1, 1.15, 0.7], tgt: [0, 0.58, 0] },
  { p: 0.79, pos: [-4.7, 2.2, -5.1], tgt: [0, 0.4, -0.35] },
  { p: 0.91, pos: [-2.0, 2.0, -6.5], tgt: [0, 0.42, -0.2] },
  { p: 1.0, pos: [-5.6, 2.5, 6.6], tgt: [0, 0.4, 0] },
];

const v3 = (a: [number, number, number]) => new THREE.Vector3(...a);
const KEYV = KEYS.map((k) => ({ p: k.p, pos: v3(k.pos), tgt: v3(k.tgt) }));

function cameraAt(p: number, outPos: THREE.Vector3, outTgt: THREE.Vector3, cut = false) {
  let i = 0;
  while (i < KEYV.length - 2 && p > KEYV[i + 1].p) i++;
  const a = KEYV[i], b = KEYV[i + 1];
  const t = cut ? (p >= b.p ? 1 : 0) : smooth(range(p, a.p, b.p));
  outPos.lerpVectors(a.pos, b.pos, t);
  outTgt.lerpVectors(a.tgt, b.tgt, t);
}

const RED = paintById("guards-red");
const CHALK = paintById("chalk");
const SHARK = paintById("shark-blue");

function Director({ rig }: { rig: React.RefObject<CarRig> }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const tmp = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      tgt: new THREE.Vector3(),
      look: new THREE.Vector3(0, 0.5, 0),
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      top: new THREE.Vector3(),
      bot: new THREE.Vector3(),
    }),
    []
  );
  const last = useRef({ coatFired: false, first: true, lastSweep: 0 });
  const spec = carById("911");
  // light band corners in world space (model space + the car's offset)
  const band = useMemo(() => {
    const o = new THREE.Vector3(...spec.offset);
    const z = spec.bandAnchor[2] - 0.035;
    return {
      // the strip leaves the car at its flanks, so the car's own lamps fill the middle
      l: new THREE.Vector3(-0.92, spec.bandAnchor[1], z + 0.35).add(o),
      r: new THREE.Vector3(0.92, spec.bandAnchor[1], z + 0.35).add(o),
      t: new THREE.Vector3(0, 0.108, z).add(o),
      b: new THREE.Vector3(0, 0.017, z).add(o),
    };
  }, [spec]);

  useFrame((_, dt) => {
    const r = rig.current;
    const now = performance.now();
    if (story.introStart < 0) story.introStart = now;
    story.intro = story.reduced ? 1 : Math.min(1, (now - story.introStart) / INTRO_MS);
    // scrolling during the intro finishes it
    if (story.p > 0.004 && story.intro < 1) story.introStart = now - INTRO_MS;
    const it = story.intro;
    const p = story.p;

    // ── camera ──
    const aspect = size.width / size.height;
    // keep the whole car in frame on narrow screens: pull back as the horizontal field of view shrinks
    const fit = Math.max(1, 1.5 / aspect);
    if (it < 1) {
      // ignition orbit: nose-left to tail
      const e = easeInOutCubic(range(it, 0.18, 0.86));
      const th = THREE.MathUtils.lerp(-0.66, -Math.PI, e);
      const rad = THREE.MathUtils.lerp(5.4, 6.8, e) * fit;
      tmp.pos.set(Math.sin(th) * rad, THREE.MathUtils.lerp(0.62, 1.02, e), Math.cos(th) * rad);
      tmp.tgt.set(0, 0.5, THREE.MathUtils.lerp(0.6, -0.2, e));
    } else {
      cameraAt(p, tmp.pos, tmp.tgt, story.reduced);
      tmp.pos.multiplyScalar(fit);
      tmp.pos.y /= fit;
      // idle breathing while the visitor reads the hero
      if (!story.reduced) {
        const idle = 1 - range(p, 0, 0.03);
        const t = now / 1000;
        // dolly and rise only, never yaw, so the light strip stays dead level
        tmp.pos.z -= (Math.sin(t * 0.32) * 0.5 + 0.5) * 0.45 * idle;
        tmp.pos.y += Math.sin(t * 0.5) * 0.05 * idle;
      }
    }
    const k = last.current.first || story.reduced ? 1 : 1 - Math.exp(-dt * (it < 1 ? 10 : 4.5));
    camera.position.lerp(tmp.pos, k);
    tmp.look.lerp(tmp.tgt, k);
    camera.lookAt(tmp.look);
    last.current.first = false;

    // ── car ──
    r.drl = range(it, 0.06, 0.2);
    r.tail = it < 1 ? range(it, 0.7, 0.8) : 1;
    r.reveal = it < 1 ? THREE.MathUtils.lerp(0, 0.86, smooth(range(it, 0.72, 0.9))) : 0.86;

    const paint = p < 0.19 ? RED : p < 0.27 ? CHALK : SHARK;
    r.paint = paint.hex;
    r.metallic = !!paint.metallic;

    const film = beats[1];
    r.lines = p > film.from - 0.01 && p < film.to + 0.01 ? 1 : 0;
    r.film = p < film.from ? 0 : p < 0.41 ? 1 : p < 0.46 ? 2 : p < film.to ? 3 : 2;
    r.finish = "gloss";

    const tint = beats[2];
    r.testStrip = p > tint.from + 0.01 && p < tint.from + 0.07 ? 1 : 0;
    r.frontDark = p > tint.from + 0.07 ? vltToDark(70) : 0;
    r.rearDark = p > tint.from + 0.1 ? vltToDark(20) : 0;
    r.wsStrip = p > tint.from + 0.13 ? 1 : 0;

    // a light runs nose to tail every few seconds while the hero sits idle
    if (it >= 1 && p < 0.02 && !story.reduced && now - last.current.lastSweep > 7000) {
      last.current.lastSweep = now;
      r.sweepAt = now + 400;
    }

    const coat = beats[3];
    if (p > coat.from + 0.015 && !last.current.coatFired) {
      last.current.coatFired = true;
      r.sweepAt = now;
    }
    if (p < coat.from) last.current.coatFired = false;
    r.ceramic = p > coat.from + 0.015 ? 0.95 : 0;

    // ── project the light band to the screen for the DOM rail ──
    tmp.a.copy(band.l).project(camera);
    tmp.b.copy(band.r).project(camera);
    tmp.top.copy(band.t).project(camera);
    tmp.bot.copy(band.b).project(camera);
    const toX = (v: number) => ((v + 1) / 2) * size.width;
    const toY = (v: number) => ((1 - v) / 2) * size.height;
    const xa = toX(tmp.a.x), xb = toX(tmp.b.x);
    story.band.x0 = Math.min(xa, xb);
    story.band.x1 = Math.max(xa, xb);
    story.band.y = (toY(tmp.top.y) + toY(tmp.bot.y)) / 2;
    story.band.h = Math.max(6, Math.abs(toY(tmp.top.y) - toY(tmp.bot.y)));
    story.band.ok = tmp.a.z < 1;
  });
  return null;
}

/**
 * The signature: a red LED strip that grows out of the 911's tail lights to both edges of the frame.
 * It lives in the scene, at tail-light height and depth, so it stays level, meets the lamps exactly,
 * and is occluded by the car like a real object. It retracts into the car once the visitor scrolls.
 */
function LightStrip() {
  const spec = carById("911");
  const left = useRef<THREE.Group>(null!);
  const right = useRef<THREE.Group>(null!);
  const mats = useMemo(
    () => ({
      core: new THREE.MeshBasicMaterial({ color: new THREE.Color(7, 0.35, 0.5), toneMapped: false }),
      halo: new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 0.02, 0.06), transparent: true, opacity: 0.35, toneMapped: false, depthWrite: false }),
    }),
    []
  );
  const g = useRef(0);
  const y = spec.glow.band![1] + spec.offset[1];
  const z = spec.glow.band![2] + spec.offset[2] - 0.02;
  const inner = 0.83;
  const L = 34;
  useFrame((_, dt) => {
    const target = (story.reduced ? 1 : range(story.intro, 0.8, 1)) * (1 - range(story.p, 0, 0.06));
    const k = 1 - Math.exp(-dt * (target > g.current ? 2.6 : 7));
    g.current += (target - g.current) * k;
    const s = Math.max(0.0001, g.current);
    left.current.scale.x = s;
    right.current.scale.x = s;
    left.current.visible = right.current.visible = g.current > 0.002;
  });
  const bar = (dir: 1 | -1) => (
    <>
      <mesh position={[(dir * L) / 2, 0, 0]} scale={[L, 0.022, 0.012]} material={mats.core}>
        <boxGeometry />
      </mesh>
      <mesh position={[(dir * L) / 2, 0, 0.01]} scale={[L, 0.07, 0.01]} material={mats.halo}>
        <boxGeometry />
      </mesh>
    </>
  );
  return (
    <>
      <group ref={left} position={[-inner, y, z]}>
        {bar(-1)}
      </group>
      <group ref={right} position={[inner, y, z]}>
        {bar(1)}
      </group>
    </>
  );
}

function ReadyFlag({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (!done.current) {
      done.current = true;
      requestAnimationFrame(onReady);
    }
  });
  return null;
}

export default function HeroScene({ onReady, active = true }: { onReady: () => void; active?: boolean }) {
  const spec = carById("911");
  const rig = useRef<CarRig>(defaultRig({ paint: RED.hex, drl: 0, tail: 0, reveal: 0 }));
  const [quality, setQuality] = useState<"high" | "low">("high");
  useEffect(() => {
    story.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (window.matchMedia("(max-width: 700px)").matches) setQuality("low");
  }, []);
  return (
    <Canvas
      shadows
      frameloop={active ? "always" : "never"}
      dpr={quality === "high" ? [1, 1.6] : [1, 1.25]}
      camera={{ position: [-3.2, 0.62, 4.3], fov: 30, near: 0.1, far: 80 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
      aria-hidden
    >
      <PerformanceMonitor onDecline={() => setQuality("low")} />
      <Suspense fallback={null}>
        <Stage scene="night" quality={quality} cursor />
        <CarModel spec={spec} rig={rig} />
        <LightStrip />
        <Effects quality={quality} bloom={0.75} />
        <ReadyFlag onReady={onReady} />
        <Director rig={rig} />
      </Suspense>
    </Canvas>
  );
}
