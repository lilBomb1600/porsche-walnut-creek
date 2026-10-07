"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { Maximize2, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { restoration } from "@/data/restoration";
import { LitHeading } from "./LitHeading";

const { episodes, car, technician } = restoration;
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * The restoration challenge as a series: a vertical player beside the seven episodes. It previews muted while on
 * screen; a tap turns the sound on and starts the episode over, and each episode rolls into the next.
 */
export function Restoration() {
  const player = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const mainBar = useRef<HTMLSpanElement>(null);
  const [idx, setIdx] = useState(0);
  const [muted, setMuted] = useState(true);
  const [engaged, setEngaged] = useState(false); // the visitor chose to watch, with sound
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [inView, setInView] = useState(false);
  const [still, setStill] = useState(false);
  const [watched, setWatched] = useState<number[]>([]);

  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const io = new IntersectionObserver(([e]) => setInView(e.intersectionRatio >= 0.5), { threshold: [0, 0.5, 1] });
    io.observe(player.current!);
    return () => io.disconnect();
  }, []);

  // muted preview while on screen until the visitor takes over; nothing keeps playing off screen
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (inView && !still && !ended && !engaged) v.play().catch(() => {});
    else if (!inView) v.pause();
  }, [inView, still, engaged, ended]);

  // Episode changes happen inside the click handler, so playback with sound counts as the visitor's own action.
  const load = (i: number, sound: boolean) => {
    const v = video.current;
    if (!v) return;
    setIdx(i);
    setEnded(false);
    if (v.getAttribute("src") !== episodes[i].src) v.src = episodes[i].src;
    v.currentTime = 0;
    v.muted = !sound;
    setMuted(!sound);
    if (sound) setEngaged(true);
    v.play().catch(() => {});
  };

  const onTap = () => {
    const v = video.current;
    if (!v) return;
    if (!engaged) return load(idx, true); // first tap: sound on, from the top
    if (ended) return load(0, true);
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const toggleMute = () => {
    const v = video.current;
    if (!v) return;
    if (!engaged) return load(idx, true);
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const fullscreen = () => {
    const v = video.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen().catch(() => {});
    else v.webkitEnterFullscreen?.();
  };

  const onTime = () => {
    const v = video.current;
    if (!v || !v.duration) return;
    const p = v.currentTime / v.duration;
    if (mainBar.current) mainBar.current.style.transform = `scaleX(${p})`;
    bars.current.forEach((b, i) => b && (b.style.transform = `scaleX(${i === idx ? p : watched.includes(i) ? 1 : 0})`));
  };

  const onEnded = () => {
    setWatched((w) => (w.includes(idx) ? w : [...w, idx]));
    if (idx < episodes.length - 1) load(idx + 1, !muted);
    else {
      setEnded(true);
      setPlaying(false);
    }
  };

  const e = episodes[idx];

  return (
    <section
      id="restoration"
      aria-labelledby="restoration-title"
      className="relative overflow-hidden border-t border-white/[0.06] px-5 py-28 sm:px-8 lg:px-12 lg:py-36"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-24 h-[520px] w-[520px] rounded-full bg-[#7a0a1e]/25 blur-[140px]"
      />
      <div className="relative mx-auto max-w-[1400px]">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <div id="restoration-title">
            <LitHeading className="text-[clamp(34px,4.8vw,72px)] leading-[0.98]">The Boxster restoration challenge.</LitHeading>
          </div>
          <p className="max-w-[48ch] text-[16px] leading-relaxed text-drl-2 text-pretty lg:justify-self-end">
            Our technician {technician} took a {car.year} Boxster with {car.miles.toLocaleString("en-US")} miles on it and brought it back,
            one episode at a time.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-start lg:gap-16">
          {/* player */}
          <div
            ref={player}
            className="relative mx-auto aspect-[9/16] w-full max-w-[420px] overflow-hidden rounded-[28px] bg-night-3 ring-1 ring-white/10 lg:mx-0"
          >
            <video
              ref={video}
              src={episodes[0].src}
              poster={e.poster}
              muted
              playsInline
              preload="metadata"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onTimeUpdate={onTime}
              onEnded={onEnded}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={onTap}
              aria-label={!engaged ? `Watch episode ${e.n} with sound` : ended ? "Watch again from episode 1" : playing ? "Pause" : "Play"}
              className="absolute inset-0 z-10 cursor-pointer"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(4_6_10/.55)_0%,transparent_20%,transparent_70%,rgb(4_6_10/.85)_100%)]"
            />

            <span className="glass-dark pointer-events-none absolute left-4 top-4 z-20 rounded-full px-3 py-1 text-[12px] font-semibold text-white tnum">
              Episode {e.n} of {episodes.length}
            </span>

            {(!engaged || ended || (!playing && engaged)) && (
              <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
                <span className="glass grid h-16 w-16 place-items-center rounded-full text-white">
                  {ended ? (
                    <RotateCcw size={22} />
                  ) : !engaged ? (
                    <Volume2 size={22} />
                  ) : (
                    <Play size={22} className="translate-x-[2px] fill-current" />
                  )}
                </span>
                {!engaged && (
                  <span className="absolute top-[calc(50%+46px)] text-[13px] font-semibold text-white [text-shadow:0_1px_12px_rgb(0_0_0/.6)]">
                    Tap to watch with sound
                  </span>
                )}
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 z-20 p-4">
              <p className="font-mark-caps text-[14px] leading-tight text-white">{e.title}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="relative block h-[3px] flex-1 overflow-hidden rounded-full bg-white/20">
                  <span ref={mainBar} className="film-bar absolute inset-0 origin-left rounded-full" style={{ transform: "scaleX(0)" }} />
                </span>
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={muted ? "Sound on" : "Sound off"}
                  className="grid h-9 w-9 place-items-center rounded-full text-white hover:bg-white/10"
                >
                  {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
                </button>
                <button
                  type="button"
                  onClick={fullscreen}
                  aria-label="Full screen"
                  className="grid h-9 w-9 place-items-center rounded-full text-white hover:bg-white/10"
                >
                  <Maximize2 size={16} />
                </button>
                {engaged && !ended && (
                  <button
                    type="button"
                    onClick={onTap}
                    aria-label={playing ? "Pause" : "Play"}
                    className="grid h-9 w-9 place-items-center rounded-full text-white hover:bg-white/10"
                  >
                    {playing ? <Pause size={16} className="fill-current" /> : <Play size={16} className="fill-current" />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* the car, then the episodes */}
          <div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-white/10 py-6 sm:grid-cols-4">
              {[
                ["Car", `${car.year} Boxster`],
                ["Generation", car.generation],
                ["Miles", car.miles.toLocaleString("en-US")],
                ["Technician", technician],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[12.5px] text-drl-dim">{k}</dt>
                  <dd className="tnum mt-1 text-[17px] font-semibold text-white">{v}</dd>
                </div>
              ))}
            </dl>

            <ol className="mt-4" aria-label="Episodes">
              {episodes.map((x, i) => {
                const on = i === idx;
                return (
                  <li key={x.n} className="border-b border-white/[0.07]">
                    <button
                      type="button"
                      onClick={() => load(i, true)}
                      aria-current={on ? "true" : undefined}
                      className="group grid w-full grid-cols-[54px_1fr_auto] items-center gap-4 py-4 text-left sm:gap-5"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={x.thumb}
                        alt=""
                        loading="lazy"
                        className={clsx(
                          "aspect-[9/16] w-[54px] rounded-lg object-cover ring-1 transition-[opacity,box-shadow] duration-300",
                          on ? "opacity-100 ring-white/40" : "opacity-60 ring-white/10 group-hover:opacity-90",
                        )}
                      />
                      <span className="min-w-0">
                        <span
                          className={clsx("font-mark-caps block text-[13px] transition-colors", on ? "text-[#ff4a5c]" : "text-drl-dim")}
                        >
                          Episode {x.n}
                        </span>
                        <span
                          className={clsx(
                            "mt-1 block text-[17px] font-semibold leading-snug transition-colors",
                            on ? "text-white" : "text-drl-2 group-hover:text-white",
                          )}
                        >
                          {x.title}
                        </span>
                        <span className="mt-1 block text-[14px] leading-snug text-drl-dim text-pretty">{x.note}</span>
                        <span className="relative mt-3 block h-[2px] overflow-hidden rounded-full bg-white/10">
                          <span
                            ref={(el) => void (bars.current[i] = el)}
                            className="film-bar absolute inset-0 origin-left rounded-full"
                            style={{ transform: `scaleX(${watched.includes(i) && !on ? 1 : 0})` }}
                          />
                        </span>
                      </span>
                      <span className="tnum self-start pt-0.5 text-[13px] text-drl-dim">{mmss(x.duration)}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <p className="mt-6 text-[12.5px] text-drl-faint">Filmed at Porsche Walnut Creek for our Instagram.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
