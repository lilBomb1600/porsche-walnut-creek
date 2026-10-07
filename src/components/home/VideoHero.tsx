"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Pause, Play } from "lucide-react";
import { PorscheWordmark } from "@/components/PorscheMark";
import { LampLink } from "@/components/ui/lamp";
import { lockPageScroll } from "@/components/SmoothScroll";
import { dealership } from "@/data/dealership";
import { heroFilm } from "@/data/media";
import { departmentStatus } from "@/lib/hours";
import { story } from "@/lib/story";
import { RaceLoader } from "./RaceLoader";

function OpenNow() {
  const [label, setLabel] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const st = departmentStatus(dealership.departments[0]);
    setLabel(st.label);
    setOpen(st.open);
  }, []);
  if (!label) return null;
  return (
    <p className="flex items-center gap-2.5 text-[13.5px] font-medium text-white/80">
      <span
        aria-hidden
        className="block h-2 w-2 rounded-full"
        style={open ? { background: "#eef4ff", boxShadow: "0 0 10px #eef4ff" } : { background: "rgb(238 244 255 / .25)" }}
      />
      {label} · {dealership.address.street}
    </p>
  );
}

/**
 * The first thing on the page: race footage at full bleed, the way porsche.com opens, behind the race-track loader.
 * The film is buffered while the 911 laps the loader's circuit and starts from its first frame on the green light.
 */
export function VideoHero() {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [film, setFilm] = useState<{ src: string; poster: string } | null>(null);
  const [buffered, setBuffered] = useState(0);
  const [ready, setReady] = useState(false);
  const [go, setGo] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [lit, setLit] = useState(false);

  // pick the cut for the screen; every load opens at the top, unless a link asked for a section
  useEffect(() => {
    const portrait = window.matchMedia("(max-aspect-ratio: 4/5)").matches;
    const laptop = window.matchMedia("(max-width: 1280px)").matches;
    setFilm(portrait ? heroFilm.phone : laptop ? heroFilm.medium : heroFilm.full);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setUserPaused(true);
    if (!window.location.hash) {
      history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
    }
    lockPageScroll(true);
    // a slow network never holds the page: after 9 s the poster stands in
    const t = window.setTimeout(() => setReady(true), 9000);
    return () => {
      window.clearTimeout(t);
      lockPageScroll(false);
    };
  }, []);

  // green light: lift the loader, roll the film from the top, light the wordmark
  useEffect(() => {
    if (!go) return;
    story.loaded = true;
    lockPageScroll(false);
    const v = video.current;
    if (v && !userPaused) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
    const a = window.setTimeout(() => setLit(true), 250);
    const b = window.setTimeout(() => setLoaderGone(true), 800);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [go]);

  // pause off screen, resume on return unless the visitor paused it
  useEffect(() => {
    const el = section.current!;
    const io = new IntersectionObserver(
      ([e]) => {
        const v = video.current;
        if (!v || !go) return;
        if (e.isIntersecting && !userPaused) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [go, userPaused]);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      setUserPaused(false);
      v.play().catch(() => {});
    } else {
      setUserPaused(true);
      v.pause();
    }
  };

  const onProgress = () => {
    const v = video.current;
    if (!v || !v.duration || !v.buffered.length) return;
    setBuffered(Math.min(1, v.buffered.end(v.buffered.length - 1) / v.duration));
  };

  return (
    <section ref={section} id="top" aria-label="Porsche Walnut Creek" className="relative h-[100svh] min-h-[560px] overflow-hidden bg-night">
      {film && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={film.poster} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
          <video
            ref={video}
            src={film.src}
            poster={film.poster}
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
            tabIndex={-1}
            onProgress={onProgress}
            onCanPlayThrough={() => setReady(true)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (bar.current && v.duration) bar.current.style.transform = `scaleX(${v.currentTime / v.duration})`;
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </>
      )}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(7_9_14/.6)_0%,transparent_18%,transparent_45%,rgb(7_9_14/.92)_100%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_70%_at_0%_100%,rgb(7_9_14/.65),transparent_62%)]" />

      <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-[max(28px,5vh)] sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <h1 className="sr-only">Porsche Walnut Creek</h1>
          <div aria-hidden data-lit={lit} className="max-w-[min(680px,84vw)]">
            <div className="hero-mark">
              <PorscheWordmark className="h-auto w-full text-white drop-shadow-[0_0_30px_rgb(0_0_0/.45)]" />
            </div>
            <p className="hero-sub font-mark-caps mt-[clamp(12px,1.6vw,22px)] text-[clamp(11px,1.5vw,18px)] text-white/85">Walnut Creek</p>
          </div>
          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-[46ch] text-[16px] leading-relaxed text-white/85 text-pretty sm:text-[17px]">
              New, Porsche Approved certified and pre-owned, factory service and our own Protection Studio, on North Main in
              Walnut Creek.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <LampLink href={dealership.links.newInventory}>
                Shop inventory <ArrowRight size={17} />
              </LampLink>
              <LampLink href="/studio" tone="ghost">
                Build your protection
              </LampLink>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between gap-4">
            <OpenNow />
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Pause film" : "Play film"}
              className="glass grid h-11 w-11 shrink-0 place-items-center rounded-full text-white transition-transform duration-300 ease-[var(--ease-out-quart)] hover:scale-105 active:scale-95"
            >
              {playing ? <Pause size={16} className="fill-current" /> : <Play size={16} className="translate-x-[1px] fill-current" />}
            </button>
          </div>
        </div>
      </div>
      <span
        ref={bar}
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-10 h-[2px] origin-left transition-transform duration-300 ease-linear"
        style={{ transform: "scaleX(0)", background: "linear-gradient(90deg,#a3061b,#ff3348)", boxShadow: "0 0 8px rgb(255 30 50 / .8)" }}
      />

      {!loaderGone && (
        <div
          className={clsx(
            "fixed inset-0 z-[70] grid place-items-center bg-night transition-opacity duration-700 ease-[var(--ease-out-quart)]",
            go && "pointer-events-none opacity-0"
          )}
          role="status"
        >
          <RaceLoader progress={buffered} done={ready} onGo={() => setGo(true)} />
        </div>
      )}
    </section>
  );
}
