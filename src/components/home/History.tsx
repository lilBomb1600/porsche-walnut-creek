"use client";

import { useEffect, useRef, useState } from "react";
import { history } from "@/data/history";
import { useRaf } from "@/lib/use-raf";

/**
 * Seventy-plus years on one LED rail. Scrolling drives the track sideways; each milestone lights up
 * in its era's Porsche color as it crosses the middle of the screen.
 */
export function History() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLDivElement | null)[]>([]);
  const glow = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const st = useRef({ x: 0, active: -1 });

  useEffect(() => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);

  useRaf(() => {
    const sec = section.current, tr = track.current;
    if (!sec || !tr || reduced) return;
    const r = sec.getBoundingClientRect();
    const total = sec.offsetHeight - window.innerHeight;
    const p = Math.min(1, Math.max(0, -r.top / total));
    const max = tr.scrollWidth - window.innerWidth;
    const target = -p * max;
    st.current.x += (target - st.current.x) * 0.14;
    tr.style.transform = `translate3d(${st.current.x}px, 0, 0)`;
    if (fill.current) fill.current.style.transform = `scaleX(${p})`;
    // light the milestone nearest the middle
    const mid = window.innerWidth / 2;
    let best = 0, bestD = Infinity;
    nodes.current.forEach((n, i) => {
      if (!n) return;
      const b = n.getBoundingClientRect();
      const d = Math.abs(b.left + b.width / 2 - mid);
      if (d < bestD) (bestD = d), (best = i);
    });
    if (best !== st.current.active) {
      st.current.active = best;
      nodes.current.forEach((n, i) => n && (n.dataset.on = String(i <= best)));
      nodes.current.forEach((n, i) => n && (n.dataset.current = String(i === best)));
      if (glow.current) glow.current.style.background = `radial-gradient(closest-side, ${history[best].color}40, transparent)`;
    }
  });

  return (
    <section
      ref={section}
      id="history"
      className="relative border-t border-white/[0.06] bg-[#05070b]"
      style={{ height: reduced ? "auto" : `${history.length * 42 + 60}vh` }}
      aria-label="Porsche history"
    >
      <div className={reduced ? "py-24" : "sticky top-0 flex h-[100dvh] flex-col justify-center overflow-hidden"}>
        <div ref={glow} aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[80vh] w-[80vh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-[background] duration-700" />
        <div className="relative px-5 sm:px-8 lg:px-12">
          <h2 className="font-livery max-w-[14ch] text-[clamp(38px,5.6vw,84px)] leading-[0.9] text-drl">Since 1948, one silhouette.</h2>
          <p className="mt-5 max-w-[48ch] text-[16px] leading-relaxed text-drl-2">
            From a hand-built roadster in Gmünd to an all-electric sports sedan. Scroll the timeline.
          </p>
        </div>

        <div className="relative mt-12">
          {!reduced && (
            <div aria-hidden className="absolute inset-x-0 top-[38px] h-[2px] bg-white/[0.07]">
              <div ref={fill} className="led-strip h-full origin-left" style={{ transform: "scaleX(0)" }} />
            </div>
          )}
          <div ref={track} className={reduced ? "grid gap-6 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-3 lg:px-12" : "flex w-max gap-6 pl-[8vw] pr-[40vw] will-change-transform"}>
            {history.map((h, i) => (
              <div
                key={h.year}
                ref={(el) => void (nodes.current[i] = el)}
                data-on={reduced ? "true" : "false"}
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
          </div>
        </div>
      </div>
    </section>
  );
}
