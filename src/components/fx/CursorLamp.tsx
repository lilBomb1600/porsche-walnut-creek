"use client";

import { useEffect, useRef } from "react";
import { cursorLight } from "@/three/Stage";

/**
 * A soft pool of lamp light that follows the pointer across the dark sections,
 * and feeds the hero's 3D softbox so the highlight on the paint tracks the cursor too.
 */
export function CursorLamp() {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...target };
    let raf = 0;
    let last = performance.now();
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      cursorLight.x = (e.clientX / window.innerWidth) * 2 - 1;
      cursorLight.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    if (!fine || reduced) return () => window.removeEventListener("pointermove", onMove);
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const k = 1 - Math.exp(-dt * 7);
      pos.x += (target.x - pos.x) * k;
      pos.y += (target.y - pos.y) * k;
      if (el.current) el.current.style.transform = `translate3d(${pos.x - 300}px, ${pos.y - 300}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div
      ref={el}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[1] hidden h-[600px] w-[600px] rounded-full mix-blend-screen [@media(hover:hover)_and_(pointer:fine)]:block"
      style={{ background: "radial-gradient(circle, rgb(150 180 255 / .09) 0%, rgb(150 180 255 / .04) 35%, transparent 70%)" }}
    />
  );
}
