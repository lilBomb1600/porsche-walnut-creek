"use client";

import { useEffect, useRef } from "react";

const WORDS = ["911", "718", "Taycan", "Panamera", "Macan", "Cayenne", "Porsche Approved", "Service", "Parts", "2555 N Main St"];

/**
 * A red LED dot-matrix sign scrolling the store's lines. Scroll speed feeds its velocity,
 * so it surges when the page moves and settles when it stops.
 */
export function LedTicker() {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let x = 0;
    let v = 0;
    let lastY = window.scrollY;
    let last = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      v += (Math.abs(dy) * 6 - v) * (1 - Math.exp(-dt * 4));
      x -= (60 + v) * dt;
      const el = track.current;
      if (el) {
        const half = el.scrollWidth / 2;
        if (-x > half) x += half;
        el.style.transform = `translate3d(${x}px, 0, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const row = (
    <span className="flex shrink-0 items-center">
      {WORDS.map((w) => (
        <span key={w} className="flex items-center">
          <span className="px-8">{w}</span>
          <span className="block h-[0.32em] w-[0.32em] bg-current" />
        </span>
      ))}
    </span>
  );
  return (
    <div className="relative overflow-hidden border-y border-[var(--line)] bg-[#050609] py-5" aria-label="Porsche Walnut Creek: 911, 718, Taycan, Panamera, Macan, Cayenne, Porsche Approved, service and parts at 2555 N Main St">
      <div
        ref={track}
        aria-hidden
        className="led-sign font-display flex w-max whitespace-nowrap text-[clamp(44px,7vw,96px)] font-black uppercase leading-none tracking-[0.04em] text-[#ff2a40] will-change-transform [text-shadow:0_0_18px_rgb(255_30_50/.8)]"
      >
        {row}
        {row}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#050609] to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#050609] to-transparent" />
    </div>
  );
}
