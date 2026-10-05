"use client";

import clsx from "clsx";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Share2 } from "lucide-react";
import { carById } from "@/data/cars";
import { paintById } from "@/data/paints";
import { SAMPLE_PRICING_NOTE, lineItems, total, usd } from "@/data/protection";
import { dealership } from "@/data/dealership";
import { configOf, shareQuery, steps, useStudio } from "@/lib/studio-store";
import { coverageItems } from "@/lib/coverage";
import { PorscheMark } from "@/components/PorscheMark";
import { LampButton } from "@/components/ui/lamp";
import { StepRail } from "./StepRail";
import { panels } from "./Panels";
import { CompareSlider, StageTitle, ViewDock } from "./StageControls";

const StudioCanvas = dynamic(() => import("./StudioCanvas"), { ssr: false });

function ShowroomSwitch() {
  const showroom = useStudio((s) => s.showroom);
  const set = useStudio((s) => s.set);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={showroom}
      onClick={() => set({ showroom: !showroom })}
      className="group flex items-center gap-2.5 rounded-full py-1.5 pl-3 pr-1.5 text-[13px] font-medium text-drl-2 transition-colors hover:text-drl"
      title="Showroom mode adds the finance handoff for use at the desk"
    >
      <span className="hidden sm:inline">Showroom mode</span>
      <span className="sm:hidden">Showroom</span>
      <span
        aria-hidden
        className="relative block shrink-0 overflow-hidden rounded-full transition-[background-color,box-shadow] duration-300"
        style={{
          width: 42,
          height: 24,
          background: showroom ? "#ffab1f" : "rgb(255 255 255 / .16)",
          boxShadow: showroom ? "0 0 14px rgb(255 171 31 / .55)" : "inset 0 0 0 1px rgb(255 255 255 / .08)",
        }}
      >
        <span
          className="absolute rounded-full bg-white shadow-[0_2px_6px_rgb(0_0_0/.35)]"
          style={{
            top: 3,
            left: 3,
            width: 18,
            height: 18,
            transform: `translateX(${showroom ? 18 : 0}px)`,
            transition: "transform 300ms cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        />
      </span>
    </button>
  );
}

function ShareButton() {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-label="Copy a link to this build"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
        } catch {}
        setDone(true);
        setTimeout(() => setDone(false), 1600);
      }}
      className="relative grid h-9 w-9 place-items-center rounded-full text-drl-2 ring-1 ring-white/10 transition-[color,background-color] hover:bg-white/[0.06] hover:text-drl"
    >
      {done ? <Check size={16} /> : <Share2 size={16} />}
      <span
        className={clsx(
          "pointer-events-none absolute right-0 top-11 whitespace-nowrap rounded-full bg-drl px-3 py-1 text-[12px] font-semibold text-night transition-[opacity,transform] duration-200",
          done ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
        )}
      >
        Link copied
      </span>
    </button>
  );
}

function TotalBar() {
  const s = useStudio();
  const cfg = configOf(s);
  const sum = total(cfg);
  const idx = steps.findIndex((x) => x.id === s.step);
  const next = steps[idx + 1];
  const prev = steps[idx - 1];
  const [bump, setBump] = useState(false);
  const last = useRef(sum);
  useEffect(() => {
    if (last.current !== sum) {
      last.current = sum;
      setBump(true);
      const t = setTimeout(() => setBump(false), 380);
      return () => clearTimeout(t);
    }
  }, [sum]);
  return (
    <div className="border-t border-[var(--line)] bg-night-2/95 px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3.5 backdrop-blur-md sm:px-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="whitespace-nowrap text-[12px] font-medium text-drl-dim">
            Estimated total<span className="hidden sm:inline"> · sample pricing</span>
          </p>
          <p
            className={clsx(
              "tnum font-display text-[26px] font-extrabold leading-tight text-drl transition-[transform,text-shadow] duration-300",
              bump && "scale-[1.04] [text-shadow:0_0_18px_rgb(238_244_255/.6)]"
            )}
            aria-live="polite"
          >
            {usd(sum)}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {prev && (
            <button
              type="button"
              aria-label={`Back to ${prev.label}`}
              onClick={() => s.goStep(prev.id)}
              className="grid h-12 w-12 place-items-center rounded-full text-drl-2 ring-1 ring-[var(--line-2)] transition-colors hover:text-drl hover:ring-drl/50"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          {next ? (
            <LampButton className="whitespace-nowrap" onClick={() => s.goStep(next.id)}>
              {next.id === "review" ? (
                "Review build"
              ) : (
                <>
                  <span className="hidden sm:inline">Next: </span>
                  {next.label}
                </>
              )}{" "}
              <ArrowRight size={17} />
            </LampButton>
          ) : (
            <LampButton tone="ghost" className="whitespace-nowrap" onClick={() => s.reset()}>
              <RotateCcw size={16} /> Start over
            </LampButton>
          )}
        </div>
      </div>
    </div>
  );
}

function PrintSheet({ shot }: { shot: string | null }) {
  const s = useStudio();
  const cfg = configOf(s);
  const car = carById(cfg.car);
  const paint = paintById(cfg.paint);
  return (
    <div className="print-sheet hidden p-10 text-black">
      <p style={{ fontWeight: 800, letterSpacing: "0.2em", fontSize: 12 }}>PORSCHE WALNUT CREEK · PROTECTION BUILD</p>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>
        {car.name}, {paint.name}
      </h1>
      {shot && <img src={shot} alt="" style={{ width: "100%", marginTop: 16, borderRadius: 8 }} />}
      <ol style={{ marginTop: 16, fontSize: 13, lineHeight: 1.7 }}>
        {coverageItems(cfg).map((c) => (
          <li key={c.n}>
            {c.n}. {c.label}
          </li>
        ))}
      </ol>
      <table style={{ width: "100%", marginTop: 16, fontSize: 13, borderCollapse: "collapse" }}>
        <tbody>
          {lineItems(cfg).map((i) => (
            <tr key={i.id} style={{ borderTop: "1px solid #ddd" }}>
              <td style={{ padding: "6px 0" }}>
                {i.label} ({i.detail})
              </td>
              <td style={{ textAlign: "right" }}>{usd(i.price)}</td>
            </tr>
          ))}
          <tr style={{ borderTop: "2px solid #000", fontWeight: 800 }}>
            <td style={{ padding: "8px 0" }}>Estimated total</td>
            <td style={{ textAlign: "right" }}>{usd(total(cfg))}</td>
          </tr>
        </tbody>
      </table>
      <p style={{ fontSize: 11, marginTop: 10 }}>{SAMPLE_PRICING_NOTE}</p>
      <p style={{ fontSize: 11, marginTop: 4 }}>
        {dealership.name} · {dealership.address.oneLine} · {dealership.phone.display}
      </p>
    </div>
  );
}

export default function StudioApp() {
  const step = useStudio((s) => s.step);
  const Panel = panels[step];
  const scroller = useRef<HTMLDivElement>(null);
  const [shot, setShot] = useState<string | null>(null);

  // dev hook for testing from the console
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") (window as unknown as { __studio: typeof useStudio }).__studio = useStudio;
  }, []);

  // read a shared build from the URL once, then keep the URL in sync (config only, never customer details)
  useEffect(() => {
    useStudio.getState().applyQuery(new URLSearchParams(window.location.search));
    let t: ReturnType<typeof setTimeout>;
    const unsub = useStudio.subscribe((s) => {
      clearTimeout(t);
      t = setTimeout(() => {
        const q = shareQuery(configOf(s)) + (s.showroom ? "&mode=showroom" : "");
        window.history.replaceState(null, "", `/studio?${q}`);
      }, 250);
    });
    return () => {
      unsub();
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [step]);

  // arrow keys move between steps when not typing
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, select, [role=slider]")) return;
      const s = useStudio.getState();
      const i = steps.findIndex((x) => x.id === s.step);
      if (e.key === "ArrowRight" && steps[i + 1]) s.goStep(steps[i + 1].id);
      if (e.key === "ArrowLeft" && steps[i - 1]) s.goStep(steps[i - 1].id);
    };
    window.addEventListener("keydown", onKey);
    const onPrint = () => {
      const c = document.querySelector<HTMLCanvasElement>(".studio-stage canvas");
      try {
        setShot(c ? c.toDataURL("image/jpeg", 0.9) : null);
      } catch {
        setShot(null);
      }
    };
    window.addEventListener("beforeprint", onPrint);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeprint", onPrint);
    };
  }, []);

  return (
    <>
      <main className="studio-app no-print grid h-[100dvh] w-full grid-cols-[minmax(0,1fr)] grid-rows-[auto_1fr] overflow-hidden bg-night">
        <header className="glass-dark relative z-20 border-x-0 border-t-0">
          <div className="grid h-[58px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 sm:px-6">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex h-9 items-center gap-2 rounded-full pl-2 pr-3 text-[13px] font-medium text-drl-2 ring-1 ring-white/10 transition-[color,background-color] hover:bg-white/[0.06] hover:text-drl"
              >
                <ArrowLeft size={16} /> <span className="hidden sm:inline">Exit</span>
              </Link>
              <span className="hidden text-[13px] text-drl-dim lg:inline">Protection Studio</span>
            </div>
            <PorscheMark />
            <div className="flex items-center gap-1.5 justify-self-end sm:gap-2">
              <ShowroomSwitch />
              <ShareButton />
            </div>
          </div>
          <div className="px-3 pb-2.5 sm:px-6">
            <StepRail className="mx-auto max-w-[880px]" />
          </div>
        </header>

        <div className="grid min-h-0 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(280px,50dvh)_1fr] lg:grid-cols-[minmax(0,1fr)_minmax(380px,440px)] lg:grid-rows-1">
          <section className="studio-stage relative min-h-0 overflow-hidden" aria-label="3D car stage">
            <StudioCanvas />
            <StageTitle />
            <CompareSlider />
            <ViewDock />
          </section>

          <aside className="flex min-h-0 flex-col border-[var(--line)] bg-night-2 lg:border-l" aria-label="Studio options">
            <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7 sm:py-8">
              <div key={step} className="animate-[panelIn_.45s_var(--ease-out-expo)_both]">
                <Panel />
              </div>
            </div>
            <TotalBar />
          </aside>
        </div>
      </main>
      <PrintSheet shot={shot} />
      <style>{`
        @keyframes panelIn { from { opacity: 0; transform: translateY(10px); filter: blur(4px); } to { opacity: 1; transform: none; filter: none; } }
        @media print { .print-sheet { display: block !important; } }
      `}</style>
    </>
  );
}
