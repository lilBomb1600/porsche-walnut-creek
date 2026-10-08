"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { reels, type Reel } from "@/data/media";
import { RailArrows, SwipeRail, type SwipeRailHandle } from "@/components/ui/SwipeRail";
import { LitHeading } from "./LitHeading";

function ReelCard({ r, armed, still }: { r: Reel; armed: boolean; still: boolean }) {
  const card = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.intersectionRatio >= 0.6), { threshold: [0, 0.6, 1] });
    io.observe(card.current!);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (inView && !still) v.play().catch(() => {});
    else v.pause();
  }, [inView, armed, still]);

  return (
    <article
      ref={card}
      className="reel-card relative aspect-[4/5] w-[min(80vw,380px)] shrink-0 overflow-hidden rounded-[24px] bg-night-3 ring-1 ring-white/10"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={r.poster} alt="" aria-hidden loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      {armed && !still && (
        <video
          ref={video}
          src={r.src}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (bar.current && v.duration) bar.current.style.transform = `scaleX(${v.currentTime / v.duration})`;
          }}
          className={clsx(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-[var(--ease-out-quart)]",
            playing ? "opacity-100" : "opacity-0"
          )}
        />
      )}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(4_6_10/.5)_0%,transparent_22%,transparent_58%,rgb(4_6_10/.92)_100%)]" />

      <div className="absolute left-4 top-4 flex gap-1.5">
        <span className="glass-dark inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold text-white">
          {r.source === "showroom" && (
            <span aria-hidden className="block h-1.5 w-1.5 rounded-full bg-[#ff3348] shadow-[0_0_8px_#ff3348]" />
          )}
          {r.source === "showroom" ? "Our showroom" : "Creator"}
        </span>
        {r.cgi && <span className="glass-dark rounded-full px-2.5 py-1 text-[12px] font-semibold text-white">CGI</span>}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="font-mark-caps text-[15px] leading-tight text-white sm:text-[16px]">{r.title}</h3>
        <a
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${r.handle} on ${r.platform}`}
          className="mt-2 inline-flex items-center gap-1 text-[13.5px] text-white/75 hover:text-white hover:underline"
        >
          @{r.handle} <span className="text-white/45">· {r.platform}</span> <ArrowUpRight size={14} />
        </a>
      </div>
      <span
        ref={bar}
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[2px] origin-left transition-transform duration-300 ease-linear"
        style={{ transform: "scaleX(0)", background: "linear-gradient(90deg,#a3061b,#ff3348)", boxShadow: "0 0 8px rgb(255 30 50 / .8)" }}
      />
    </article>
  );
}

/**
 * Films from our showroom feed and from creators, in a row you swipe or drag sideways. Each film plays while it's
 * on screen.
 */
export function Reels() {
  const section = useRef<HTMLElement>(null);
  const rail = useRef<SwipeRailHandle>(null);
  const line = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const [armed, setArmed] = useState(false);
  const [ends, setEnds] = useState({ start: true, end: false });

  const onScroll = (p: number) => {
    if (line.current) line.current.style.transform = `scaleX(${Math.max(0.08, p)})`;
    const start = p < 0.01;
    const end = p > 0.99;
    setEnds((e) => (e.start === start && e.end === end ? e : { start, end }));
  };

  // films load once the section is close
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setArmed(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(section.current!);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={section} id="reels" aria-labelledby="reels-title" className="relative border-t border-white/[0.06] bg-night py-24 lg:py-32">
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <div id="reels-title">
            <LitHeading className="text-[clamp(34px,4.6vw,68px)] leading-[0.98]">From the feed.</LitHeading>
          </div>
          <div className="flex items-end justify-between gap-6 lg:justify-self-end">
            <p className="max-w-[44ch] text-[16px] leading-relaxed text-drl-2 text-pretty">
              Short films from our showroom floor, and from creators whose work we love, shown with their permission.
            </p>
            <RailArrows onStep={(d) => rail.current?.step(d)} start={ends.start} end={ends.end} className="hidden shrink-0 sm:flex" />
          </div>
        </div>
      </div>
      <SwipeRail
        ref={rail}
        label="Films"
        onScroll={onScroll}
        className="mt-10 gap-4 px-5 scroll-px-5 sm:gap-6 sm:px-8 sm:scroll-px-8 lg:px-12 lg:scroll-px-12 xl:px-[max(48px,calc((100vw-1400px)/2+48px))] xl:scroll-px-[max(48px,calc((100vw-1400px)/2+48px))]"
      >
        {reels.map((r) => (
          <ReelCard key={r.id} r={r} armed={armed} still={!!reduce} />
        ))}
      </SwipeRail>
      <div className="mx-auto mt-8 max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <span aria-hidden className="relative block h-[2px] w-full max-w-[240px] overflow-hidden rounded-full bg-white/10">
          <span ref={line} className="film-bar absolute inset-0 origin-left rounded-full" style={{ transform: "scaleX(0.08)" }} />
        </span>
      </div>
    </section>
  );
}
