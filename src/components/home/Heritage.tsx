"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { LampLink } from "@/components/ui/lamp";
import { LitHeading } from "./LitHeading";

const HeritageScene = dynamic(() => import("@/three/HeritageScene"), { ssr: false });

export function Heritage() {
  const box = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = box.current!;
    const near = new IntersectionObserver(([e]) => e.isIntersecting && setMounted(true), { rootMargin: "900px 0px" });
    const vis = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "120px 0px" });
    near.observe(el);
    vis.observe(el);
    return () => {
      near.disconnect();
      vis.disconnect();
    };
  }, []);

  return (
    <section id="heritage" className="relative overflow-hidden border-y border-[var(--line)] bg-[#04060a]">
      <div ref={box} className="relative grid min-h-[min(92vh,900px)] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative z-10 flex flex-col justify-center px-5 py-24 sm:px-8 lg:px-12">
          <LitHeading className="text-[clamp(38px,5.2vw,80px)] leading-[0.92]">Half a century of the light band.</LitHeading>
          <p className="mt-8 max-w-[44ch] text-[16.5px] leading-relaxed text-drl-2 text-pretty">
            In 1975 the 930 Turbo stretched a band of red across its tail. The 911 still wears one. Whatever year yours is, our
            certified Porsche technicians will look after it, and they&apos;ll service any vehicle you drive.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <LampLink href="/studio?car=930" tone="ghost">
              Put the 930 in the studio <ArrowRight size={17} />
            </LampLink>
          </div>
          <p className="mt-10 text-[12.5px] text-drl-dim">1975 Porsche 911 Turbo (930), rendered live.</p>
        </div>
        <div className="relative h-[56vh] lg:h-auto">
          {mounted && <HeritageScene active={active} />}
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 hidden w-40 bg-gradient-to-r from-[#04060a] to-transparent lg:block" />
        </div>
      </div>
    </section>
  );
}
