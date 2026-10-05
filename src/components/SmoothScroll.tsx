"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { story } from "@/lib/story";

gsap.registerPlugin(ScrollTrigger);

/** Lenis smooth scroll driving GSAP's ScrollTrigger from one ticker. Off for reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const updatePage = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      story.pageP = max > 0 ? window.scrollY / max : 0;
    };
    if (reduced) {
      window.addEventListener("scroll", updatePage, { passive: true });
      updatePage();
      return () => window.removeEventListener("scroll", updatePage);
    }
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", () => {
      ScrollTrigger.update();
      updatePage();
    });
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    // in-page anchors glide instead of jumping
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href")!;
      const el = id === "#top" ? 0 : document.querySelector<HTMLElement>(id);
      if (el === null) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement | number, { offset: -72, duration: 1.4 });
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
  return null;
}
