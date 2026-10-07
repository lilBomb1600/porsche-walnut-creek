"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { LampLink } from "@/components/ui/lamp";
import { DOCK_END, beats, range, story } from "@/lib/story";
import { useRaf } from "@/lib/use-raf";

const HeroScene = dynamic(() => import("@/three/HeroScene"), { ssr: false });

const beatColor: Record<(typeof beats)[number]["id"], string> = {
  paint: "#ff3348",
  film: "#7fd0ff",
  tint: "#c9a7ff",
  coat: "#f4c400",
};

const captions: Record<(typeof beats)[number]["id"], { title: string; body: string }> = {
  paint: {
    title: "Start with the paint on your deal.",
    body: "Guards Red, Chalk, Shark Blue and seventeen more Porsche colors. Every film and coating shows on the color you'll actually drive.",
  },
  film: {
    title: "See exactly where the film ends.",
    body: "The bright line is your coverage. The dashed lines are the other tiers, so “full front” finally means something you can see.",
  },
  tint: {
    title: "Every shade, on your own glass.",
    body: "Test strips run the length of the window, and the studio flags anything darker than California allows up front.",
  },
  coat: {
    title: "Then make it shine.",
    body: "Ceramic lays a hard, slick layer over paint and film. Watch the light run nose to tail.",
  },
};

export function HomeStory() {
  const section = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const [coverGone, setCoverGone] = useState(false);
  const [inView, setInView] = useState(false);
  const [active, setActive] = useState(true);
  const hero = useRef<HTMLDivElement>(null);
  const capRefs = useRef<(HTMLDivElement | null)[]>([]);
  const segRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const railBox = useRef<HTMLDivElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = section.current!;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => (story.p = self.progress),
    });
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => {
      st.kill();
      io.disconnect();
    };
  }, []);

  // The studio's opening orbit waits until the section is actually on screen and the car has loaded.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), { rootMargin: "0px 0px -35% 0px" }); // the section is six screens tall: watch its top edge
    io.observe(section.current!);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!ready || !inView) return;
    story.ready = true;
    const t = setTimeout(() => setCoverGone(true), 800);
    return () => clearTimeout(t);
  }, [ready, inView]);

  useRaf(() => {
    const p = story.p;
    const it = story.intro;
    if (hero.current) {
      const inOp = story.reduced ? 1 : range(it, 0.86, 0.95);
      const outOp = 1 - range(p, 0.015, DOCK_END * 0.8);
      hero.current.style.opacity = String(inOp * outOp);
      hero.current.style.transform = `translate3d(0, ${(1 - inOp) * 18 - range(p, 0, DOCK_END) * 40}px, 0)`;
      hero.current.style.visibility = inOp * outOp < 0.01 ? "hidden" : "visible";
    }
    if (cue.current) cue.current.style.opacity = String(range(it, 0.95, 1) * (1 - range(p, 0.005, 0.04)));
    beats.forEach((b, i) => {
      const el = capRefs.current[i];
      if (el) {
        const fadeIn = range(p, b.from + 0.005, b.from + 0.04);
        const fadeOut = 1 - range(p, b.to - 0.03, b.to);
        const v = Math.min(fadeIn, fadeOut);
        el.style.opacity = String(v);
        el.style.transform = `translate3d(0, ${(1 - fadeIn) * 26 - (1 - fadeOut) * 20}px, 0)`;
        el.style.filter = story.reduced ? "none" : `blur(${(1 - v) * 6}px)`;
        el.style.visibility = v < 0.01 ? "hidden" : "visible";
      }
      const seg = segRefs.current[i];
      if (seg) {
        const state = p >= b.to ? "seen" : p >= b.from ? "active" : "ahead";
        if (seg.dataset.state !== state) {
          seg.dataset.state = state;
          seg.className = `block h-[4px] w-full rounded-full transition-[background,box-shadow] duration-500 ${state === "ahead" ? "state-dim" : ""}`;
          seg.style.background =
            state === "active" ? "#f4f8ff" : state === "seen" ? "linear-gradient(180deg,#ff4a5c,#e8102a 55%,#a3061b)" : "";
          seg.style.boxShadow =
            state === "active"
              ? "0 0 8px rgb(238 244 255 / .95), 0 0 22px rgb(170 200 255 / .55)"
              : state === "seen"
              ? "0 0 8px rgb(255 30 50 / .75), 0 0 20px rgb(232 16 42 / .4)"
              : "none";
        }
      }
    });
    if (railBox.current) {
      const v = range(p, beats[0].from - 0.02, beats[0].from + 0.02) * (1 - range(p, 0.93, 0.96));
      railBox.current.style.opacity = String(v);
      railBox.current.style.visibility = v < 0.01 ? "hidden" : "visible";
    }
    if (end.current) {
      const v = range(p, 0.935, 0.975);
      end.current.style.opacity = String(v);
      end.current.style.transform = `translate3d(0, ${(1 - v) * 24}px, 0)`;
      end.current.style.visibility = v < 0.01 ? "hidden" : "visible";
    }
  });

  return (
    <section ref={section} id="studio-story" className="relative h-[620vh]" aria-label="The Protection Studio">
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        <div className="absolute inset-0">
          <HeroScene active={active} onReady={() => setReady(true)} />
        </div>

        {/* plain cover until the car is ready */}
        {!coverGone && (
          <div
            aria-hidden
            className="absolute inset-0 z-20 bg-night transition-opacity duration-700 ease-[var(--ease-out-quart)]"
            style={{ opacity: ready && inView ? 0 : 1 }}
          />
        )}

        {/* studio intro, under the light band */}
        <div
          ref={hero}
          className="absolute inset-x-0 bottom-0 z-10 px-5 pb-[max(28px,5vh)] opacity-0 sm:px-8 lg:px-12"
          style={{ visibility: "hidden" }}
        >
          <div className="max-w-[1400px]">
            <h2 className="font-livery max-w-[14ch] text-[clamp(40px,6.4vw,96px)] leading-[0.95] text-white text-balance [text-shadow:0_2px_30px_rgb(0_0_0/.45)]">
              The Protection Studio.
            </h2>
            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <p className="max-w-[46ch] text-[16px] leading-relaxed text-drl-2 sm:text-[17px] text-pretty">
                See your Porsche in its best light. Pick the paint, wrap it in film, tint it and coat it on a live 911 before
                you ever sign, then drive the real one home from North Main.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <LampLink href="/studio">
                  Build your protection <ArrowRight size={17} />
                </LampLink>
                <LampLink href="/studio?mode=showroom" tone="ghost">
                  Showroom mode
                </LampLink>
              </div>
            </div>
          </div>
        </div>

        <div ref={cue} className="pointer-events-none absolute left-1/2 top-[18vh] z-10 -translate-x-1/2 opacity-0" aria-hidden>
          <p className="font-display text-[10.5px] font-bold tracking-[0.42em] text-drl-dim">SCROLL TO DRIVE THE STUDIO</p>
        </div>

        {/* beat rail: the studio's own step grammar */}
        <div ref={railBox} className="absolute left-5 right-5 top-[86px] z-10 opacity-0 sm:left-8 sm:right-auto sm:w-[420px] lg:left-12" style={{ visibility: "hidden" }}>
          <ol className="flex gap-1.5" aria-label="Studio walkthrough">
            {beats.map((b, i) => (
              <li key={b.id} className="flex-1">
                <span className="font-display mb-2 block text-[11px] font-bold tracking-[0.16em] text-drl-2 uppercase">{b.label}</span>
                <span ref={(el) => void (segRefs.current[i] = el)} className="state-dim block h-[4px] w-full rounded-full" />
              </li>
            ))}
          </ol>
        </div>

        {/* beat captions */}
        {beats.map((b, i) => (
          <div
            key={b.id}
            ref={(el) => void (capRefs.current[i] = el)}
            className="glass absolute bottom-[max(28px,6vh)] left-4 right-4 z-10 max-w-[540px] rounded-[28px] p-6 opacity-0 sm:left-8 sm:p-8 lg:left-12"
            style={{ visibility: "hidden" }}
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-white">
              <span aria-hidden className="block h-2 w-2 rounded-full" style={{ background: beatColor[b.id], boxShadow: `0 0 10px ${beatColor[b.id]}` }} />
              {b.label}
            </span>
            <h2 className="font-livery text-[clamp(22px,3vw,40px)] leading-[1.12] text-drl text-balance">
              {captions[b.id].title}
            </h2>
            <p className="mt-4 max-w-[44ch] text-[15.5px] leading-relaxed text-drl-2 sm:text-[17px] text-pretty">{captions[b.id].body}</p>
          </div>
        ))}

        {/* end card */}
        <div
          ref={end}
          className="absolute inset-x-0 bottom-0 z-10 px-5 pb-[max(32px,8vh)] opacity-0 sm:px-8 lg:px-12"
          style={{ visibility: "hidden" }}
        >
          <h2 className="font-livery text-[clamp(32px,5.6vw,84px)] leading-[1] text-drl">
            Now build yours.
          </h2>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <LampLink href="/studio">
              Open the studio <ArrowRight size={17} />
            </LampLink>
            <Link
              href="/studio?mode=showroom"
              className="rounded-full px-4 py-3 text-[14px] font-semibold text-drl-2 underline decoration-[var(--line-2)] underline-offset-4 transition-colors hover:text-drl"
            >
              Showroom mode, for the desk
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
