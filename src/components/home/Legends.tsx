"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { legendCategories, legends, type Legend, type LegendCategory } from "@/data/legends";
import { MotionPhoto } from "@/components/media/MotionPhoto";
import { LitHeading } from "./LitHeading";

/** Photo header for the cars you can buy today; it plays its film while the card is pointed at. */
function LegendMedia({ l, active }: { l: Legend; active: boolean }) {
  const m = l.media!;
  return (
    <div className="relative -mx-7 -mt-7 mb-7 sm:-mx-8 sm:-mt-8">
      <MotionPhoto
        src={m.src}
        alt={m.alt}
        position={m.position}
        loop={m.loop}
        active={active}
        sizes="(min-width: 1280px) 30vw, (min-width: 768px) 46vw, 92vw"
        className="aspect-[16/10]"
        imgClassName="transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgb(12_17_27/.7))]" />
      {(m.loop || m.studio) && (
        <span aria-hidden className="glass-dark absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold text-white">
          {m.studio && !(active && m.loop) ? (
            "Rendered in our studio"
          ) : (
            <>
              <Play size={11} className="fill-current" /> {m.studio ? "Filmed in our showroom" : "Film"}
            </>
          )}
        </span>
      )}
    </div>
  );
}

/** The hall of legends: tabs slide a lit pill between eras; each card glows in its car's color. */
export function Legends() {
  const [cat, setCat] = useState<LegendCategory>("Hypercars");
  const [hover, setHover] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const list = legends.filter((l) => l.category === cat);
  const ease = [0.23, 1, 0.32, 1] as const;

  return (
    <section id="legends" className="relative overflow-hidden border-t border-white/[0.06] px-5 py-28 sm:px-8 lg:px-12 lg:py-36">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-20 h-[480px] w-[480px] rounded-full bg-[#e8102a]/15 blur-[130px]" />
      <div aria-hidden className="pointer-events-none absolute -right-40 bottom-10 h-[480px] w-[480px] rounded-full bg-[#00a4d6]/12 blur-[130px]" />
      <div className="relative mx-auto max-w-[1400px]">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <LitHeading className="text-[clamp(30px,4.2vw,60px)] leading-[1.02]">The legends.</LitHeading>
          <p className="max-w-[48ch] text-[16px] leading-relaxed text-drl-2 text-pretty lg:justify-self-end">
            Hypercars, race winners and the cars in our showroom today. The numbers behind the name.
          </p>
        </div>

        <div role="tablist" aria-label="Legend categories" className="no-scrollbar mt-12 flex gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/[0.03] p-1 sm:inline-flex">
          {legendCategories.map((c) => (
            <button
              key={c}
              role="tab"
              type="button"
              aria-selected={cat === c}
              onClick={() => setCat(c)}
              className={clsx(
                "relative shrink-0 whitespace-nowrap rounded-full px-5 py-2.5 text-[14px] font-medium transition-colors duration-200",
                cat === c ? "text-night" : "text-drl-2 hover:text-white"
              )}
            >
              {cat === c && (
                <motion.span
                  layoutId="legend-pill"
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 38 }}
                  className="absolute inset-0 rounded-full bg-white shadow-[0_6px_24px_-6px_rgb(190_215_255/.7)]"
                />
              )}
              <span className="relative z-10">{c}</span>
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((l, i) => (
              <motion.article
                key={l.id}
                layout={!reduce}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16, filter: "blur(6px)" }}
                transition={{ duration: 0.55, ease, delay: reduce ? 0 : i * 0.06 }}
                onPointerEnter={(e) => e.pointerType === "mouse" && setHover(l.id)}
                onPointerLeave={(e) => e.pointerType === "mouse" && setHover(null)}
                className="legend-card glass group relative overflow-hidden rounded-[28px] p-7 sm:p-8"
                style={{ ["--era" as string]: l.color }}
              >
                {l.media && <LegendMedia l={l} active={hover === l.id} />}
                {!l.media && <div aria-hidden className="legend-glow pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl" />}
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-mark-caps text-[18px] leading-tight text-white sm:text-[20px]">{l.name}</h3>
                    <p className="tnum mt-1.5 text-[13px] text-white/60">{l.years}</p>
                  </div>
                  <span aria-hidden className="mt-1 block h-2.5 w-2.5 rounded-full" style={{ background: l.color, boxShadow: `0 0 12px ${l.color}` }} />
                </div>
                <p className="relative mt-8 flex items-baseline gap-2.5">
                  <span className="legend-stat font-livery tnum text-[clamp(44px,5vw,64px)] leading-none">{l.stat.value}</span>
                  <span className="text-[14px] font-semibold uppercase tracking-[0.18em] text-white/70">{l.stat.unit}</span>
                </p>
                <dl className="relative mt-7 space-y-2.5 border-t border-white/10 pt-5">
                  {l.specs.map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[110px_1fr] gap-3 text-[13.5px]">
                      <dt className="text-white/50">{k}</dt>
                      <dd className="tnum text-white/90">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="relative mt-5 text-[14px] leading-relaxed text-white/70 text-pretty">{l.story}</p>
                {l.media?.studio && (
                  <Link href={l.media.studio} className="relative mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-white hover:underline">
                    Build one in the studio <ArrowRight size={15} />
                  </Link>
                )}
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
