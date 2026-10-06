"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { reel } from "@/data/media";

/**
 * Porsche's own film, full-bleed. The frame opens like an aperture as it scrolls in, and the chapter rail
 * names the car on screen while a lit bar runs under it, like the tail-light strip of the car itself.
 */
export function FilmBand() {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const reduce = useReducedMotion();
  const [src, setSrc] = useState<string | null>(null);
  const [chapter, setChapter] = useState(0);
  const [paused, setPaused] = useState(false); // the visitor's choice, separate from offscreen pausing
  const [playing, setPlaying] = useState(false);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start end", "start start"] });
  const inset = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [9, 0]);
  const radius = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [40, 0]);
  const clipPath = useMotionTemplate`inset(${inset}% ${inset}% 0% ${inset}% round ${radius}px)`;
  const lift = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.12, 1]);

  // Pick the file for the screen, and only once the band is close.
  useEffect(() => {
    const el = section.current!;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setSrc(window.matchMedia("(max-width: 900px)").matches ? reel.small : reel.src);
        io.disconnect();
      },
      { rootMargin: "800px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Reduced motion starts paused; the visitor can still press play.
  useEffect(() => {
    if (reduce) setPaused(true);
  }, [reduce]);

  // Play only while on screen and not paused by the visitor.
  useEffect(() => {
    const el = section.current!;
    const v = video.current;
    if (!v || !src) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !paused) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [src, paused]);

  // Chapter bars track the playhead without re-rendering every frame.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const v = video.current;
      if (v) {
        const t = v.currentTime;
        let idx = reel.chapters.findIndex((c) => t >= c.start && t < c.end);
        if (idx < 0) idx = reel.chapters.length - 1;
        reel.chapters.forEach((c, i) => {
          const p = i < idx ? 1 : i > idx ? 0 : Math.min(1, (t - c.start) / (c.end - c.start));
          bars.current[i]?.style.setProperty("--p", p.toFixed(4));
        });
        setChapter((prev) => (prev === idx ? prev : idx));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const seek = (i: number) => {
    const v = video.current;
    if (!v) return;
    v.currentTime = reel.chapters[i].start + 0.02;
    setPaused(false);
    v.play().catch(() => {});
  };

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      setPaused(false);
      v.play().catch(() => {});
    } else {
      setPaused(true);
      v.pause();
    }
  };

  return (
    <section ref={section} id="film" aria-label="Porsche film" className="relative bg-night">
      <motion.div style={{ clipPath }} className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-night-2">
        <motion.div style={{ scale: lift }} className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={reel.poster} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
          {src && (
            <video
              ref={video}
              src={src}
              poster={reel.poster}
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden
              tabIndex={-1}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </motion.div>

        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(7_9_14/.55)_0%,transparent_22%,transparent_52%,rgb(7_9_14/.88)_100%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_0%_100%,rgb(7_9_14/.6),transparent_60%)]" />

        <div className="absolute inset-x-0 bottom-0 px-5 pb-8 sm:px-8 sm:pb-10 lg:px-12 lg:pb-12">
          <div className="mx-auto max-w-[1400px]">
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="font-livery max-w-[14ch] text-[clamp(34px,5.4vw,84px)] leading-[0.95] text-white text-balance [text-shadow:0_2px_30px_rgb(0_0_0/.45)]">
                  Seen at speed.
                </h2>
                <p className="mt-4 max-w-[44ch] text-[15.5px] leading-relaxed text-white/80 text-pretty">
                  A GTS at sunset, a Turbo S on the coast, a GT3 RS under the lights and a Macan crossing the city after dark.
                </p>
              </div>
              <button
                type="button"
                onClick={toggle}
                aria-label={playing ? "Pause film" : "Play film"}
                className="glass grid h-14 w-14 shrink-0 place-items-center rounded-full text-white transition-transform duration-300 ease-[var(--ease-out-quart)] hover:scale-105 active:scale-95"
              >
                {playing ? <Pause size={20} className="fill-current" /> : <Play size={20} className="translate-x-[1px] fill-current" />}
              </button>
            </div>

            <ol className="mt-9 grid grid-cols-4 gap-2 sm:gap-4" aria-label="Chapters">
              {reel.chapters.map((c, i) => (
                <li key={c.name}>
                  <button
                    type="button"
                    onClick={() => seek(i)}
                    aria-current={chapter === i ? "true" : undefined}
                    className="group block w-full pt-2 text-left"
                  >
                    <span className="relative block h-[3px] overflow-hidden rounded-full bg-white/20">
                      <span
                        ref={(el) => void (bars.current[i] = el)}
                        className="film-bar absolute inset-y-0 left-0 w-full origin-left rounded-full"
                      />
                    </span>
                    <span
                      className={clsx(
                        "mt-3 block truncate text-[12px] font-semibold transition-colors duration-300 sm:text-[14px]",
                        chapter === i ? "text-white" : "text-white/55 group-hover:text-white/85"
                      )}
                    >
                      {c.name}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-right text-[11.5px] text-white/45">Film: Porsche AG</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
