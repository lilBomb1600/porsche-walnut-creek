"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

/**
 * The page loader: a 911 laps a small circuit while the studio loads, its tail-light trail filling the track
 * like the LED strip in the header. The start lights run red while it loads, amber as it nears the line and
 * green when the car crosses it, then the car launches and the hero takes over.
 */

// Closed circuit, start/finish on the bottom straight. Every joint is tangent-continuous so the car never snaps.
const TRACK =
  "M110 196 L290 196 C340 196 372 180 372 140 C372 100 360 56 326 46 C292 36 262 58 236 76 C210 94 186 92 168 72 C150 52 124 30 92 34 C60 38 34 62 36 98 C37.5 125 64 128 66 150 C68 172 82 196 110 196 Z";

// Corners that get red-and-white kerbs.
const KERBS = [
  "M290 196 C340 196 372 180 372 140",
  "M372 140 C372 100 360 56 326 46",
  "M236 76 C210 94 186 92 168 72",
  "M92 34 C60 38 34 62 36 98",
  "M36 98 C37.5 125 64 128 66 150",
];

type Phase = "red" | "amber" | "green";

const LIGHTS: { id: Phase; on: string; off: string; glow: string }[] = [
  { id: "red", on: "#ff2a3d", off: "#2a0b10", glow: "0 0 10px #ff2a3d, 0 0 28px rgb(255 42 61 / .65)" },
  { id: "amber", on: "#ffb21f", off: "#2a1f08", glow: "0 0 10px #ffb21f, 0 0 28px rgb(255 178 31 / .6)" },
  { id: "green", on: "#36e27a", off: "#0a2614", glow: "0 0 10px #36e27a, 0 0 28px rgb(54 226 122 / .6)" },
];

const BAR: Record<Phase, string> = {
  red: "linear-gradient(180deg,#ff4a5c,#e8102a 55%,#a3061b)",
  amber: "linear-gradient(180deg,#ffd06b,#ffb21f 55%,#c47c00)",
  green: "linear-gradient(180deg,#7dffb0,#36e27a 55%,#139b4a)",
};

export function RaceLoader({ progress, done, onGo }: { progress: number; done: boolean; onGo: () => void }) {
  const track = useRef<SVGPathElement>(null);
  const trail = useRef<SVGPathElement>(null);
  const car = useRef<SVGGElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const meter = useRef<HTMLDivElement>(null);
  const input = useRef({ progress, done, onGo });
  const [phase, setPhase] = useState<Phase>("red");

  useEffect(() => {
    input.current = { progress, done, onGo };
  }, [progress, done, onGo]);

  useEffect(() => {
    const path = track.current;
    if (!path || !trail.current) return;
    const L = path.getTotalLength();
    trail.current.style.strokeDasharray = `${L} ${L}`;
    let shown = 0; // fraction of the lap drawn, never moves backwards
    let creep = 0; // keeps the car rolling while one large file downloads
    let launched = -1; // performance.now() at the green light
    let lap = 0; // distance travelled after the green light
    let last = performance.now();
    let raf = 0;
    let lastPhase: Phase = "red";

    const tick = (now: number) => {
      if (!trail.current) return; // unmounted
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { progress: real, done: ready } = input.current;

      if (launched < 0) {
        creep = Math.min(0.9, creep + dt * 0.05);
        const goal = ready ? 1 : Math.min(0.96, Math.max(real, Math.min(creep, real + 0.12)));
        const gap = goal - shown;
        if (gap > 0) {
          // at least ~1.4 s for a full lap, so even a cached visit shows the car going round
          const step = ready ? dt / 1.1 : Math.min(dt / 1.4, Math.max(gap * (1 - Math.exp(-dt * 2.5)), dt * 0.03));
          shown = Math.min(goal, shown + step);
        }
        if (ready && shown >= 1) {
          launched = now;
          window.setTimeout(() => input.current.onGo(), 650);
        }
      } else {
        lap += dt * (0.4 + Math.min(1, (now - launched) / 900) * 1.1); // launch: the car pulls away from the line
      }

      const along = ((Math.min(1, shown) + lap) % 1) * L;
      const pt = path.getPointAtLength(along);
      const ahead = path.getPointAtLength((along + 1.5) % L);
      const deg = (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI;
      car.current?.setAttribute("transform", `translate(${pt.x.toFixed(2)} ${pt.y.toFixed(2)}) rotate(${deg.toFixed(1)})`);
      trail.current.style.strokeDashoffset = String(L * (1 - Math.min(1, shown)));
      if (fill.current) fill.current.style.transform = `scaleX(${Math.min(1, shown)})`;
      const n = Math.round(Math.min(1, shown) * 100);
      if (pct.current && pct.current.textContent !== `${n}%`) {
        pct.current.textContent = `${n}%`;
        meter.current?.setAttribute("aria-valuenow", String(n));
      }
      const next: Phase = launched >= 0 ? "green" : shown >= 0.5 ? "amber" : "red";
      if (next !== lastPhase) {
        lastPhase = next;
        setPhase(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="flex w-[min(560px,calc(100vw-40px))] flex-col items-center">
      <div
        className="flex items-center gap-3 rounded-full bg-[#0d1119] px-4 py-3 ring-1 ring-white/[0.08] shadow-[inset_0_1px_0_rgb(255_255_255/.06)]"
        aria-hidden
      >
        {LIGHTS.map((l) => {
          const on = l.id === phase;
          return (
            <span
              key={l.id}
              className="block h-4 w-4 rounded-full transition-[background-color,box-shadow] duration-200"
              style={{ background: on ? l.on : l.off, boxShadow: on ? l.glow : "inset 0 1px 2px rgb(0 0 0 / .6)" }}
            />
          );
        })}
      </div>

      <svg viewBox="14 16 382 202" className="mt-8 w-full overflow-visible" aria-hidden>
        <defs>
          <filter id="rl-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="rl-paint" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9e0618" />
            <stop offset="0.5" stopColor="#ff3a4f" />
            <stop offset="1" stopColor="#9e0618" />
          </linearGradient>
          <linearGradient id="rl-beam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#eef4ff" stopOpacity="0.38" />
            <stop offset="1" stopColor="#eef4ff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* asphalt with white edge lines, kerbs on the corners and a dashed centre line */}
        <path d={TRACK} fill="none" stroke="rgb(238 244 255 / .16)" strokeWidth="17" strokeLinejoin="round" />
        {KERBS.map((d) => (
          <g key={d}>
            <path d={d} fill="none" stroke="#eef4ff" strokeOpacity="0.55" strokeWidth="19" />
            <path d={d} fill="none" stroke="#e8102a" strokeOpacity="0.85" strokeWidth="19" strokeDasharray="3 3" />
          </g>
        ))}
        <path ref={track} d={TRACK} fill="none" stroke="#141a26" strokeWidth="15" strokeLinejoin="round" />
        <path d={TRACK} fill="none" stroke="rgb(238 244 255 / .1)" strokeWidth="0.8" strokeDasharray="4 7" />

        {/* start / finish */}
        <g transform="translate(107.5 188.5)">
          {Array.from({ length: 12 }).map((_, i) => (
            <rect
              key={i}
              x={(i % 2) * 2.5}
              y={Math.floor(i / 2) * 2.5}
              width="2.5"
              height="2.5"
              fill={(i + Math.floor(i / 2)) % 2 ? "#0b0e14" : "#eef4ff"}
            />
          ))}
        </g>

        {/* the lap so far, lit like a tail-light strip */}
        <path
          ref={trail}
          d={TRACK}
          fill="none"
          stroke="#ff2a3d"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#rl-glow)"
          style={{ strokeDashoffset: 9999 }}
        />

        {/* a 911 from above, nose along +x */}
        <g ref={car} transform="translate(110 196)">
          <g transform="scale(1.2)">
            <path d="M10 -3.4 L44 -12 L44 12 L10 3.4 Z" fill="url(#rl-beam)" />
            <path
              d="M11 0 C11 -3.4 9.6 -4.6 6 -4.7 L-5.5 -5 C-9.6 -5 -11 -3.8 -11 0 C-11 3.8 -9.6 5 -5.5 5 L6 4.7 C9.6 4.6 11 3.4 11 0 Z"
              fill="url(#rl-paint)"
            />
            <path
              d="M3.8 0 C3.8 -3 3 -3.6 1.5 -3.7 L-4 -3.6 C-5.6 -3.5 -6.2 -2.6 -6.2 0 C-6.2 2.6 -5.6 3.5 -4 3.6 L1.5 3.7 C3 3.6 3.8 3 3.8 0 Z"
              fill="#0a0d13"
            />
            <rect x="-3.7" y="-2.9" width="5" height="5.8" rx="1.3" fill="#c80c22" />
            <ellipse cx="9.4" cy="-3" rx="1.1" ry="0.85" fill="#eef4ff" />
            <ellipse cx="9.4" cy="3" rx="1.1" ry="0.85" fill="#eef4ff" />
            <rect x="-11.4" y="-4.1" width="1" height="8.2" rx="0.5" fill="#ff3348" filter="url(#rl-glow)" />
          </g>
        </g>
      </svg>

      <div
        ref={meter}
        role="progressbar"
        aria-label="Loading the studio"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        className="mt-8 w-full"
      >
        <span className="relative block h-[3px] overflow-hidden rounded-full bg-white/[0.1]">
          <span
            ref={fill}
            className={clsx("absolute inset-0 origin-left rounded-full transition-[background] duration-300")}
            style={{ transform: "scaleX(0)", background: BAR[phase] }}
          />
        </span>
        <span ref={pct} className="font-display tnum mt-3 block text-center text-[12px] font-bold tracking-[0.2em] text-drl-dim">
          0%
        </span>
      </div>
    </div>
  );
}
