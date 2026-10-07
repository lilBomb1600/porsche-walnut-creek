"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { lineup, MSRP_NOTE, PRICES_CHECKED, type Fuel, type ModelLine } from "@/data/lineup";
import { dealership } from "@/data/dealership";
import { MotionPhoto } from "@/components/media/MotionPhoto";
import { LitHeading } from "./LitHeading";

const FUEL_DOT: Record<Fuel, string> = {
  Gasoline: "#ffab1f",
  Hybrid: "#b6e34a", // e-hybrid acid green
  Electric: "#7fd0ff",
};

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** The official model signature, drawn in lamp white through a mask so it can glow. */
function Signature({ sig, name }: { sig: ModelLine["signature"]; name: string }) {
  return (
    <span
      role="img"
      aria-label={name}
      className="model-signature block"
      style={{
        width: `calc(${sig.w}px * var(--sig-k))`,
        aspectRatio: `${sig.w} / ${sig.h}`,
        WebkitMaskImage: `url(${sig.src})`,
        maskImage: `url(${sig.src})`,
      }}
    />
  );
}

/** Our showroom film or Porsche's: the card plays ours first, and a click anywhere on the photo flips it. */
function FilmSwitch({ porsche, car, onPick }: { porsche: boolean; car: string; onPick: (porsche: boolean) => void }) {
  return (
    <div
      role="group"
      aria-label="Which film plays"
      className="glass-dark inline-flex shrink-0 rounded-full p-1 text-[12.5px] font-semibold"
    >
      {[
        { label: "Our showroom", value: false, title: `${car}, filmed at Porsche Walnut Creek` },
        { label: "Porsche film", value: true, title: "Porsche AG" },
      ].map((o) => (
        <button
          key={o.label}
          type="button"
          title={o.title}
          aria-pressed={porsche === o.value}
          onClick={() => onPick(o.value)}
          className={clsx(
            "rounded-full px-3 py-1 transition-colors duration-200",
            porsche === o.value ? "bg-white text-night" : "text-white/80 hover:text-white",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ModelCard({ m, active, onActive }: { m: ModelLine; active: boolean; onActive: (id: string | null) => void }) {
  const [porsche, setPorsche] = useState(false);
  // every new look at the card starts on our own film
  useEffect(() => {
    if (!active) setPorsche(false);
  }, [active]);
  const pick = (p: boolean) => {
    setPorsche(p);
    onActive(m.id);
  };
  return (
    <article
      data-id={m.id}
      onPointerEnter={(e) => e.pointerType === "mouse" && onActive(m.id)}
      onPointerLeave={(e) => e.pointerType === "mouse" && onActive(null)}
      onFocus={() => onActive(m.id)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && onActive(null)}
      onClick={(e) => m.showroom && !(e.target as HTMLElement).closest("a,button") && pick(!porsche)}
      className={clsx(
        "model-card group relative isolate overflow-hidden rounded-[28px] bg-night-3 ring-1 ring-white/10",
        m.showroom && "cursor-pointer",
      )}
    >
      <MotionPhoto
        src={m.photo.src}
        alt={m.photo.alt}
        position={m.photo.position}
        loops={m.showroom ? [m.showroom, m.loop] : [m.loop]}
        which={m.showroom && porsche ? 1 : 0}
        active={active}
        sizes="(min-width: 768px) 50vw, 100vw"
        className="aspect-[4/5] sm:aspect-[5/4]"
        imgClassName="transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(4_6_10/.78)_0%,rgb(4_6_10/.2)_24%,transparent_40%,transparent_48%,rgb(4_6_10/.55)_68%,rgb(4_6_10/.94)_100%)]"
      />

      <h3 className="absolute inset-x-0 top-0 flex justify-center pt-[clamp(22px,3.2vw,40px)]">
        <a href={m.newUrl} target="_blank" rel="noopener noreferrer" className="rounded-md outline-offset-8">
          <Signature sig={m.signature} name={m.name} />
        </a>
      </h3>

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:p-8">
        <ul className="flex flex-wrap gap-1.5" aria-label="Powertrains">
          {m.from === null && (
            <li className="glass-dark rounded-full px-3 py-1 text-[12.5px] font-semibold text-white">Unavailable for new orders</li>
          )}
          {m.fuels.map((f) => (
            <li
              key={f}
              className="glass-dark inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] font-semibold text-white"
            >
              <span
                aria-hidden
                className="block h-1.5 w-1.5 rounded-full"
                style={{ background: FUEL_DOT[f], boxShadow: `0 0 8px ${FUEL_DOT[f]}` }}
              />
              {f}
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <div className="min-w-0 max-w-[40ch]">
            <p className="text-[15.5px] leading-relaxed text-white/90 text-pretty sm:text-[17px]">{m.line}</p>
            <p className="mt-2 text-[15px] text-white/75">
              {m.from ? (
                <>
                  From <span className="tnum font-semibold text-white">{usd(m.from)}</span>*
                </>
              ) : (
                <a href={m.newUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-amber hover:underline">
                  See the cars in stock
                </a>
              )}
              <span aria-hidden className="mx-2 text-white/30">
                ·
              </span>
              <a href={m.usedUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">
                Pre-owned
              </a>
            </p>
          </div>
          {/* the film switch sits bottom right, out of the photo's way */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <a
              href={m.newUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-dark inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-3 text-[15px] font-semibold text-white transition-[background-color,color,transform] duration-300 ease-[var(--ease-out-quart)] hover:bg-white hover:text-night active:scale-[0.97]"
            >
              Explore the {m.name} <ArrowRight size={17} />
            </a>
            {m.showroom && (
              <div className="ml-auto">
                <FilmSwitch porsche={porsche} car={m.showroom.car} onPick={pick} />
              </div>
            )}
          </div>
        </div>
      </div>
      <span
        aria-hidden
        className={clsx(
          "absolute inset-x-8 bottom-0 h-[2px] origin-center rounded-full transition-transform duration-700 ease-[var(--ease-out-expo)]",
          active ? "scale-x-100" : "scale-x-0",
        )}
        style={{ background: "linear-gradient(90deg,#a3061b,#ff3348 30%,#ff4a5c 50%,#ff3348 70%,#a3061b)", boxShadow: "var(--bar-glow)" }}
      />
    </article>
  );
}

/**
 * Every model line as a photo card under its official signature. Pointing at a card plays its film (on a phone,
 * the card in view plays): our own showroom film where we have one, Porsche's film a click away.
 */
export function Lineup() {
  const [active, setActive] = useState<string | null>(null);
  const rail = useRef<HTMLDivElement>(null);

  // Touch screens have no hover: the card that sits fully in view is the active one.
  useEffect(() => {
    if (!window.matchMedia("(hover: none)").matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.intersectionRatio > 0.7).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (seen) setActive((seen.target as HTMLElement).dataset.id!);
      },
      { threshold: [0.4, 0.7, 0.9, 1] },
    );
    rail.current?.querySelectorAll<HTMLElement>("[data-id]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="lineup" className="relative px-5 pb-28 pt-32 sm:px-8 lg:px-12 lg:pt-40">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <LitHeading className="text-[clamp(38px,5.6vw,84px)] leading-[0.92]">Every Porsche line, under one roof.</LitHeading>
          <p className="max-w-[48ch] text-[16px] leading-relaxed text-drl-2 text-pretty lg:justify-self-end">
            New, Porsche Approved certified and pre-owned. Inventory changes daily, so every link opens the store&apos;s live listings.
          </p>
        </div>

        <div ref={rail} className="mt-14 grid gap-4 sm:gap-6 lg:grid-cols-2 lg:gap-7">
          {lineup.map((m) => (
            <ModelCard key={m.id} m={m} active={active === m.id} onActive={setActive} />
          ))}
        </div>

        <p className="mt-12 max-w-[110ch] text-[12.5px] leading-relaxed text-drl-faint">
          *{MSRP_NOTE} Starting prices as listed on porsche.com on {PRICES_CHECKED}. Photos, film and model signatures: Porsche AG. Showroom
          films: Porsche Walnut Creek.
        </p>

        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-[15px] font-semibold">
          <a
            href={dealership.links.cpo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-drl hover:underline"
          >
            Porsche Approved certified pre-owned <ArrowUpRight size={16} />
          </a>
          <a
            href={dealership.links.electric}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-drl-2 hover:text-drl hover:underline"
          >
            Electric and hybrid inventory <ArrowUpRight size={16} />
          </a>
          <a
            href={dealership.links.offers}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-drl-2 hover:text-drl hover:underline"
          >
            Current offers <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
