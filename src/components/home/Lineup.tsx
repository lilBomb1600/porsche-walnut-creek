"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { lineup } from "@/data/lineup";
import { dealership } from "@/data/dealership";
import { LitHeading } from "./LitHeading";

/** Model lines lettered like badges. A row lights when you point at it, or when it crosses the middle of a phone screen. */
export function Lineup() {
  const [active, setActive] = useState<string | null>(null);
  const [touch, setTouch] = useState(false);
  const rows = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const coarse = window.matchMedia("(hover: none)").matches;
    setTouch(coarse);
    if (!coarse) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive((e.target as HTMLElement).dataset.id!)),
      { rootMargin: "-45% 0px -45% 0px" }
    );
    rows.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, []);

  return (
    <section id="lineup" className="relative px-5 pb-28 pt-36 sm:px-8 lg:px-12 lg:pt-44">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <LitHeading className="text-[clamp(38px,5.6vw,84px)] leading-[0.92]">Every Porsche line, under one roof.</LitHeading>
          <p className="max-w-[48ch] text-[16px] leading-relaxed text-drl-2 text-pretty lg:justify-self-end">
            New, Porsche Approved certified and pre-owned. Inventory changes daily, so every link below opens the store&apos;s live
            listings.
          </p>
        </div>

        <ul className="mt-16 border-t border-[var(--line)]" onMouseLeave={() => !touch && setActive(null)}>
          {lineup.map((m, i) => {
            const on = active === m.id;
            return (
              <li
                key={m.id}
                ref={(el) => void (rows.current[i] = el)}
                data-id={m.id}
                onMouseEnter={() => !touch && setActive(m.id)}
                className="group relative border-b border-[var(--line)]"
              >
                <div className="grid grid-cols-1 items-center gap-x-8 gap-y-3 py-6 md:grid-cols-[1fr_auto] md:py-7">
                  <a
                    href={m.newUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onFocus={() => setActive(m.id)}
                    className={clsx(
                      "font-display block text-[clamp(52px,10.5vw,168px)] font-black leading-[0.82] tracking-[-0.02em] transition-[color,text-shadow] duration-500 ease-[var(--ease-out-quart)]",
                      on ? "text-drl [text-shadow:0_0_40px_rgb(170_200_255/.28)]" : "text-drl-faint"
                    )}
                  >
                    {m.name}
                  </a>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 md:flex-col md:items-end md:gap-2">
                    <p className={clsx("text-[14px] font-medium transition-colors duration-500", on ? "text-drl-2" : "text-drl-dim")}>
                      {m.styles.join(" · ")}
                    </p>
                    <div className="flex items-center gap-4 text-[14px] font-semibold">
                      <a href={m.newUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-drl hover:underline">
                        New <ArrowUpRight size={15} />
                      </a>
                      <a href={m.usedUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-drl-2 hover:text-drl hover:underline">
                        Pre-owned <ArrowUpRight size={15} />
                      </a>
                    </div>
                  </div>
                </div>
                <span
                  aria-hidden
                  className={clsx(
                    "absolute -bottom-px left-0 h-[2px] w-full origin-left transition-transform duration-700 ease-[var(--ease-out-expo)]",
                    on ? "scale-x-100" : "scale-x-0"
                  )}
                  style={{ background: "#eef4ff", boxShadow: "0 0 8px rgb(238 244 255 / .9), 0 0 22px rgb(170 200 255 / .45)" }}
                />
              </li>
            );
          })}
        </ul>

        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[15px] font-semibold">
          <a href={dealership.links.cpo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-drl hover:underline">
            Porsche Approved certified pre-owned <ArrowUpRight size={16} />
          </a>
          <a href={dealership.links.electric} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-drl-2 hover:text-drl hover:underline">
            Electric and hybrid inventory <ArrowUpRight size={16} />
          </a>
          <a href={dealership.links.offers} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-drl-2 hover:text-drl hover:underline">
            Current offers <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
