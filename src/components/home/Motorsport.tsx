"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { petitLeMans as race } from "@/data/media";

/**
 * The latest win, told over Porsche's own race photograph. The four moments of the race light up in order
 * along a red strip, the same tail-light grammar as every heading on the page.
 */
export function Motorsport() {
  const strip = useRef<HTMLOListElement>(null);
  const [lit, setLit] = useState(false);

  useEffect(() => {
    const el = strip.current!;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLit(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="motorsport" aria-labelledby="motorsport-title" className="relative overflow-hidden border-t border-white/[0.06] bg-night">
      <div className="relative min-h-[max(100svh,760px)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/media/petit-1.jpg"
          srcSet="/media/petit-1-1200.jpg 1200w, /media/petit-1.jpg 2400w"
          sizes="100vw"
          alt="The Porsche 963 crossing the line at night during Petit Le Mans"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-[58%_50%]"
        />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(7_9_14/.85)_0%,rgb(7_9_14/.15)_30%,rgb(7_9_14/.25)_55%,rgb(7_9_14/.95)_100%)]" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(90%_70%_at_0%_100%,rgb(7_9_14/.75),transparent_65%)]" />

        <figure className="glass absolute right-12 top-32 hidden w-[320px] overflow-hidden rounded-[22px] p-2 xl:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/media/petit-2-1200.jpg"
            alt="A Porsche 963 at speed past the crowd at Road Atlanta"
            loading="lazy"
            decoding="async"
            className="aspect-[16/10] w-full rounded-[16px] object-cover object-[45%_40%]"
          />
          <figcaption className="px-2 pb-1 pt-2.5 text-[12.5px] text-white/75">Road Atlanta, Braselton, Georgia</figcaption>
        </figure>

        <div className="relative mx-auto flex min-h-[max(100svh,760px)] max-w-[1400px] flex-col justify-end px-5 pb-12 pt-40 sm:px-8 lg:px-12 lg:pb-16">
          <h2 id="motorsport-title" className="font-livery max-w-[16ch] text-[clamp(34px,5vw,76px)] leading-[0.98] text-white text-balance [text-shadow:0_2px_30px_rgb(0_0_0/.5)]">
            Ten hours at Road Atlanta. A Porsche on top.
          </h2>
          <p className="mt-6 max-w-[56ch] text-[16px] leading-relaxed text-white/80 text-pretty">
            {race.team}&apos;s {race.car} of {race.drivers.slice(0, -1).join(", ")} and {race.drivers.at(-1)} won the 29th Petit Le
            Mans on {race.date}, through rain, a red flag and sixteen full-course cautions, to close the IMSA season. Porsche also kept
            the Michelin Endurance Cup manufacturers&apos; title for a third straight year.
          </p>
          <a
            href={race.report}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex w-fit items-center gap-1.5 text-[15px] font-semibold text-white hover:underline"
          >
            Read the race report <ArrowUpRight size={16} />
          </a>

          <ol ref={strip} className="relative mt-14 grid grid-cols-2 gap-x-6 gap-y-8 pt-8 md:grid-cols-4" aria-label="How the race went">
            <span aria-hidden className="absolute left-0 right-0 top-0 h-[3px] rounded-full bg-white/15" />
            <span
              aria-hidden
              className={clsx(
                "absolute left-0 right-0 top-0 h-[3px] origin-left rounded-full transition-transform duration-[1800ms] ease-[var(--ease-out-expo)]",
                lit ? "scale-x-100" : "scale-x-0"
              )}
              style={{ background: "linear-gradient(180deg,#ff4a5c,#e8102a 55%,#a3061b)", boxShadow: "var(--bar-glow)" }}
            />
            {race.laps.map((l, i) => (
              <li
                key={l.label}
                className={clsx("relative transition-[opacity,transform] duration-700 ease-[var(--ease-out-quart)]", lit ? "translate-y-0 opacity-100" : "translate-y-2 opacity-40")}
                style={{ transitionDelay: lit ? `${250 + i * 320}ms` : "0ms" }}
              >
                <span
                  aria-hidden
                  className={clsx("absolute -top-[37px] left-0 hidden h-[13px] md:block w-[13px] rounded-full ring-2 ring-night transition-colors duration-500", lit ? "bg-[#ff3348]" : "bg-white/30")}
                  style={{ transitionDelay: lit ? `${250 + i * 320}ms` : "0ms", boxShadow: lit ? "0 0 12px #ff3348" : undefined }}
                />
                <p className="font-mark-caps text-[13px] text-white sm:text-[14px]">{l.label}</p>
                <p className="mt-1.5 text-[14px] leading-snug text-white/65">{l.note}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 text-[11.5px] text-white/45">Photos: Porsche AG</p>
        </div>
      </div>
    </section>
  );
}
