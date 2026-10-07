"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { reels, type Reel } from "@/data/media";
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
      className="reel-card relative aspect-[4/5] w-[min(80vw,420px,calc((100svh-280px)*0.8))] shrink-0 overflow-hidden rounded-[24px] bg-night-3 ring-1 ring-white/10"
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
 * Films from our showroom feed and from creators, as a strip that slides sideways while the page scrolls down.
 * Each film plays while it's in view.
 */
export function Reels() {
  const section = useRef<HTMLElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [dist, setDist] = useState(0);
  const [armed, setArmed] = useState(false);

  // how far the strip has to travel: its full width less the screen
  useEffect(() => {
    const el = strip.current!;
    const measure = () => setDist(Math.max(0, el.scrollWidth - document.documentElement.clientWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

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

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, (p) => -p * dist);

  return (
    <section
      ref={section}
      id="reels"
      aria-labelledby="reels-title"
      className="relative border-t border-white/[0.06] bg-night"
      style={reduce ? undefined : { height: `calc(100svh + ${dist}px)` }}
    >
      <div className={clsx("flex flex-col justify-center overflow-hidden py-20", !reduce && "sticky top-0 h-[100svh] min-h-[620px]")}>
        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr] lg:items-end">
            <div id="reels-title">
              <LitHeading className="text-[clamp(34px,4.6vw,68px)] leading-[0.98]">From the feed.</LitHeading>
            </div>
            <p className="max-w-[48ch] text-[16px] leading-relaxed text-drl-2 text-pretty lg:justify-self-end">
              Short films from our showroom floor, and from creators whose work we love, shown with their permission.
            </p>
          </div>
        </div>
        <motion.div
          ref={strip}
          style={reduce ? undefined : { x }}
          className={clsx(
            "mt-10 flex w-max gap-4 px-5 sm:gap-6 sm:px-8 lg:px-12 xl:px-[max(48px,calc((100vw-1400px)/2+48px))]",
            reduce && "max-w-full overflow-x-auto"
          )}
        >
          {reels.map((r) => (
            <ReelCard key={r.id} r={r} armed={armed} still={!!reduce} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
