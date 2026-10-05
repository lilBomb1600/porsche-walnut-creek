"use client";

import clsx from "clsx";
import { useCallback, useRef } from "react";
import { carById } from "@/data/cars";
import { paintById, swatchBackground } from "@/data/paints";
import { useStudio, type ViewId } from "@/lib/studio-store";

const views: { id: ViewId; label: string }[] = [
  { id: "orbit", label: "Orbit" },
  { id: "front", label: "Front" },
  { id: "side", label: "Side" },
  { id: "rear", label: "Rear" },
  { id: "top", label: "Top" },
];

/** Title plate: car and paint, lettered like the badge on the decklid. */
export function StageTitle() {
  const car = carById(useStudio((s) => s.car));
  const paint = paintById(useStudio((s) => s.paint));
  return (
    <div className="glass pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-3.5 rounded-2xl py-2.5 pl-2.5 pr-5 sm:left-6 sm:top-6">
      <span aria-hidden className="block h-11 w-11 rounded-[10px]" style={{ background: swatchBackground(paint) }} />
      <span>
        <span className="font-livery block text-[clamp(18px,2vw,26px)] leading-none text-white">{car.name}</span>
        <span className="mt-1.5 block text-[13px] font-medium text-white/80" aria-live="polite">
          {paint.name}
        </span>
      </span>
    </div>
  );
}

export function ViewDock() {
  const view = useStudio((s) => s.view);
  const setView = useStudio((s) => s.setView);
  const compare = useStudio((s) => s.compare);
  const set = useStudio((s) => s.set);
  return (
    <div className="absolute inset-x-3 bottom-3 z-10 flex flex-wrap items-end justify-between gap-2 sm:inset-x-6 sm:bottom-6">
      <div role="group" aria-label="Camera" className="glass relative flex rounded-full p-1">
        {views.map((v) => (
          <button
            key={v.id}
            type="button"
            aria-pressed={view === v.id}
            onClick={() => setView(v.id)}
            className={clsx(
              "rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors sm:px-3.5",
              view === v.id ? "bg-white text-night shadow-[0_4px_14px_rgb(0_0_0/.25)]" : "text-white/85 hover:text-white"
            )}
          >
            {v.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        aria-pressed={compare}
        onClick={() => set({ compare: !compare, split: 0.5 })}
        className={clsx(
          "relative flex items-center gap-2.5 rounded-full px-4 py-2.5 text-[12.5px] font-semibold ring-1 backdrop-blur-md transition-colors",
          compare ? "bg-white text-night ring-white" : "glass text-white/90 ring-transparent hover:text-white"
        )}
      >
        <span aria-hidden className="flex h-3 w-4 items-stretch gap-[2px]">
          <span className={clsx("w-1/2 rounded-l-sm", compare ? "bg-night/40" : "bg-drl/35")} />
          <span className={clsx("w-1/2 rounded-r-sm", compare ? "bg-night" : "bg-drl")} />
        </span>
        Factory vs. protected
      </button>
    </div>
  );
}

/** A vertical lamp you drag across the car: factory finish on the left, your build on the right. */
export function CompareSlider() {
  const compare = useStudio((s) => s.compare);
  const split = useStudio((s) => s.split);
  const set = useStudio((s) => s.set);
  const box = useRef<HTMLDivElement>(null);
  const move = useCallback(
    (clientX: number) => {
      const r = box.current?.getBoundingClientRect();
      if (!r) return;
      set({ split: Math.min(0.97, Math.max(0.03, (clientX - r.left) / r.width)) });
    },
    [set]
  );
  if (!compare) return null;
  return (
    <div ref={box} className="absolute inset-0 z-[5]">
      <div
        role="slider"
        tabIndex={0}
        aria-label="Compare factory and protected finish"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(split * 100)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") set({ split: Math.max(0.03, split - 0.03) });
          if (e.key === "ArrowRight") set({ split: Math.min(0.97, split + 0.03) });
        }}
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          move(e.clientX);
        }}
        onPointerMove={(e) => {
          if ((e.target as HTMLElement).hasPointerCapture(e.pointerId)) move(e.clientX);
        }}
        className="absolute inset-y-0 w-10 -translate-x-1/2 cursor-ew-resize touch-none"
        style={{ left: `${split * 100}%` }}
      >
        <span
          aria-hidden
          className="absolute inset-y-[8%] left-1/2 w-[3px] -translate-x-1/2 rounded-full"
          style={{ background: "#f4f8ff", boxShadow: "0 0 10px rgb(238 244 255 / .95), 0 0 30px rgb(170 200 255 / .5)" }}
        />
        <span className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-drl text-night shadow-[0_6px_24px_rgb(0_0_0/.5)]">
          <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden>
            <path d="M6 1L1 6l5 5M12 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      <span className="pointer-events-none absolute top-[7%] font-display text-[11px] font-bold tracking-[0.18em] text-drl-dim" style={{ right: `${(1 - split) * 100 + 2.5}%` }}>
        FACTORY
      </span>
      <span className="pointer-events-none absolute top-[7%] font-display text-[11px] font-bold tracking-[0.18em] text-drl" style={{ left: `${split * 100 + 2.5}%` }}>
        PROTECTED
      </span>
    </div>
  );
}
