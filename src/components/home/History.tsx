"use client";

import { useRef, useState } from "react";
import { history } from "@/data/history";
import { RailArrows, SwipeRail, type SwipeRailHandle } from "@/components/ui/SwipeRail";

/**
 * Seventy-plus years on one LED rail you swipe or drag yourself. The rail fills as you move along it, and the
 * milestones light up in their era's Porsche color as you reach them.
 */
export function History() {
  const rail = useRef<SwipeRailHandle>(null);
  const fill = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLDivElement | null)[]>([]);
  const glow = useRef<HTMLDivElement>(null);
  const active = useRef(-1);
  const [ends, setEnds] = useState({ start: true, end: false });

  const onScroll = (p: number) => {
    if (fill.current) fill.current.style.transform = `scaleX(${Math.max(0.04, p)})`;
    // the lit milestone walks from the first card to the last across the rail, so it is always on screen
    const i = Math.round(p * (history.length - 1));
    if (i !== active.current) {
      active.current = i;
      nodes.current.forEach((n, j) => {
        if (!n) return;
        n.dataset.on = String(j <= i);
        n.dataset.current = String(j === i);
      });
      if (glow.current) glow.current.style.background = `radial-gradient(closest-side, ${history[i].color}40, transparent)`;
    }
    const start = p < 0.01;
    const end = p > 0.99;
    setEnds((e) => (e.start === start && e.end === end ? e : { start, end }));
  };

  return (
    <section id="history" className="relative overflow-hidden border-t border-white/[0.06] bg-[#05070b] py-24 lg:py-32" aria-label="Porsche history">
      <div
        ref={glow}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[80vh] w-[80vh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-[background] duration-700"
      />
      <div className="relative mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-6 px-5 sm:px-8 lg:px-12">
        <div>
          <h2 className="font-livery max-w-[14ch] text-[clamp(38px,5.6vw,84px)] leading-[0.9] text-drl">Since 1948, one silhouette.</h2>
          <p className="mt-5 max-w-[48ch] text-[16px] leading-relaxed text-drl-2">
            From a hand-built roadster in Gmünd to an all-electric sports sedan. Swipe through the timeline.
          </p>
        </div>
        <RailArrows onStep={(d) => rail.current?.step(d)} start={ends.start} end={ends.end} className="hidden sm:flex" />
      </div>

      <div className="relative mt-12">
        <div aria-hidden className="absolute inset-x-0 top-[38px] h-[2px] bg-white/[0.07]">
          <div ref={fill} className="led-strip h-full origin-left" style={{ transform: "scaleX(0.04)" }} />
        </div>
        <SwipeRail
          ref={rail}
          label="Porsche timeline"
          onScroll={onScroll}
          className="gap-6 px-5 pb-2 scroll-px-5 sm:px-8 sm:scroll-px-8 lg:px-12 lg:scroll-px-12 xl:px-[max(48px,calc((100vw-1400px)/2+48px))] xl:scroll-px-[max(48px,calc((100vw-1400px)/2+48px))]"
        >
          {history.map((h, i) => (
            <div
              key={h.year}
              ref={(el) => void (nodes.current[i] = el)}
              data-on="false"
              data-current="false"
              className="timeline-node group relative w-[min(78vw,360px)] shrink-0"
              style={{ ["--era" as string]: h.color }}
            >
              <span aria-hidden className="timeline-dot absolute left-0 top-[31px] block h-4 w-4 rounded-full border-2 border-white/25 bg-[#05070b]" />
              <p className="timeline-year font-livery mt-0 pl-7 text-[clamp(44px,5.4vw,76px)] leading-none">{h.year}</p>
              <div className="glass mt-6 rounded-3xl p-6">
                <h3 className="font-display text-[20px] font-extrabold text-white">{h.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-white/75">{h.text}</p>
              </div>
            </div>
          ))}
        </SwipeRail>
      </div>
    </section>
  );
}
