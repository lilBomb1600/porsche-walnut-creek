"use client";

import clsx from "clsx";
import { useState } from "react";
import { Check, Copy, Link2, Mail, Phone, Printer, RotateCcw } from "lucide-react";
import { cars, carById } from "@/data/cars";
import { PAINT_PRICE_NOTE, paintById, paintGroups, paints, swatchBackground, type Paint } from "@/data/paints";
import {
  CA_FRONT_MIN_VLT,
  SAMPLE_PRICING_NOTE,
  ceramicTiers,
  filmFinishes,
  filmTiers,
  lineItems,
  tintCombos,
  tintPrices,
  tintShades,
  total,
  usd,
  windshieldOptions,
  type TintShade,
} from "@/data/protection";
import { dealership } from "@/data/dealership";
import { sceneList, type SceneId } from "@/three/Stage";
import { configOf, shareQuery, useStudio } from "@/lib/studio-store";
import { coverageItems } from "@/lib/coverage";
import { FINANCE_EMAIL, buildSummary } from "@/lib/summary";
import { LampButton, LampLine, OptionRow, Segmented } from "@/components/ui/lamp";

function PanelHead({ title, intro }: { title: string; intro?: string }) {
  return (
    <header className="mb-5">
      <h2 className="font-display text-[26px] font-extrabold leading-[1.05] tracking-[-0.01em] text-drl">{title}</h2>
      {intro && <p className="mt-2 max-w-[38ch] text-[14px] leading-relaxed text-drl-dim text-pretty">{intro}</p>}
    </header>
  );
}

function SubHead({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-2.5 mt-7 flex items-baseline justify-between gap-3 first:mt-0">
      <h3 className="text-[14px] font-semibold text-drl-2">{children}</h3>
      {aside && <span className="tnum text-[13px] text-drl-dim">{aside}</span>}
    </div>
  );
}

/* ───────────── Car ───────────── */
export function CarPanel() {
  const car = useStudio((s) => s.car);
  const setCar = useStudio((s) => s.setCar);
  return (
    <div>
      <PanelHead title="Pick the car" intro="Two generations of 911, fifty years apart. Every option in the studio works on both." />
      <div role="radiogroup" aria-label="Car" className="space-y-1">
        {cars.map((c) => (
          <OptionRow
            key={c.id}
            selected={car === c.id}
            onSelect={() => setCar(c.id)}
            title={<span className="font-display text-[17px] font-extrabold tracking-[0.01em]">{c.name}</span>}
            note={c.id === "911" ? "991 generation, all-wheel drive" : "The original whale-tail Turbo, 1975"}
            aside={<span className="text-drl-dim">{c.year}</span>}
          />
        ))}
      </div>
    </div>
  );
}

/* ───────────── Paint ───────────── */
/** Configurator swatch: a rounded square of folded paint at true saturation. Selection is an outline ring with a gap. */
function Swatch({ paint, on, size = "full" }: { paint: Paint; on: boolean; size?: "full" | "sm" }) {
  return (
    <span
      aria-hidden
      className={clsx(
        "relative block aspect-square overflow-hidden rounded-[12px] transition-[outline-color,transform] duration-200 ease-[var(--ease-out-quart)]",
        size === "sm" ? "w-12" : "w-full",
        "outline-2 outline-offset-[3px]",
        on ? "outline outline-drl" : "outline outline-transparent group-hover:outline-drl/35"
      )}
      style={{ background: swatchBackground(paint) }}
    >
      {paint.metallic && (
        <span
          className="absolute inset-0 opacity-40 mix-blend-overlay"
          style={{ backgroundImage: "radial-gradient(rgb(255 255 255 / .35) 0.6px, transparent 0.7px)", backgroundSize: "3px 3px" }}
        />
      )}
    </span>
  );
}

export function PaintPanel() {
  const paint = useStudio((s) => s.paint);
  const setPaint = useStudio((s) => s.setPaint);
  const [hover, setHover] = useState<string | null>(null);
  const current = paintById(paint);
  const shown = hover ? paintById(hover) : current;
  const group = paintGroups.find((g) => g.id === shown.group)!;
  return (
    <div>
      <PanelHead title="Exterior color" intro="Pick the color on your deal, so every film and coating shows on the paint you'll actually drive." />
      <div className="mb-7 flex items-center gap-4 rounded-2xl border border-[var(--line)] bg-drl/[0.035] p-3 pr-4" aria-live="polite">
        <Swatch paint={shown} on={false} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-semibold text-drl">{shown.name}</p>
          <p className="text-[13px] text-drl-dim">{shown.group}</p>
        </div>
        <p className="tnum text-[15px] font-semibold text-drl-2">{group.price}</p>
      </div>
      {paintGroups.map((g) => (
        <section key={g.id} className="mb-7">
          <div className="mb-3 flex items-baseline gap-2.5">
            <h3 className="text-[16px] font-semibold text-drl">{g.id}</h3>
            <span className="tnum text-[15px] text-drl-dim">{g.price}</span>
          </div>
          {g.note && <p className="-mt-1.5 mb-3 text-[13px] text-drl-dim">{g.note}</p>}
          <div role="radiogroup" aria-label={`${g.id} colors`} className="grid grid-cols-5 gap-2.5">
            {paints
              .filter((p) => p.group === g.id)
              .map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={paint === p.id}
                  aria-label={`${p.name}, ${g.price}`}
                  title={p.name}
                  onClick={() => setPaint(p.id)}
                  onMouseEnter={() => setHover(p.id)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(p.id)}
                  onBlur={() => setHover(null)}
                  className="group block rounded-[12px] p-0 transition-transform duration-150 active:scale-[0.96]"
                >
                  <Swatch paint={p} on={paint === p.id} />
                </button>
              ))}
          </div>
        </section>
      ))}
      <p className="mt-1 text-[12px] leading-relaxed text-drl-dim">
        {PAINT_PRICE_NOTE} On-screen color is approximate; see a paint sample at the store before you order.
      </p>
    </div>
  );
}

/* ───────────── Film ───────────── */
export function FilmPanel() {
  const film = useStudio((s) => s.film);
  const finish = useStudio((s) => s.finish);
  const showLines = useStudio((s) => s.showLines);
  const set = useStudio((s) => s.set);
  return (
    <div>
      <PanelHead
        title="Wrap it in film"
        intro="Clear film takes the rock chips so your paint doesn't. The bright line on the car is where your film ends; the dashed lines show the other options."
      />
      <SubHead aside="Sample pricing">Coverage</SubHead>
      <div role="radiogroup" aria-label="Film coverage" className="space-y-1">
        {filmTiers.map((t) => (
          <OptionRow
            key={t.tier}
            selected={film === t.tier}
            onSelect={() => set({ film: t.tier })}
            onHover={(on) => set({ hoverTier: on ? t.tier : -1 })}
            title={t.name}
            note={t.covers}
            aside={t.price ? usd(t.price) : undefined}
          />
        ))}
      </div>
      <SubHead>Finish</SubHead>
      <Segmented
        label="Film finish"
        value={finish}
        onChange={(v) => set({ finish: v })}
        options={filmFinishes.map((f) => ({ id: f.id, label: f.name, note: f.uplift ? `${f.note} · +${f.uplift * 100}%` : f.note }))}
      />
      {film === 0 && <p className="mt-3 text-[13px] text-drl-dim">Choose a coverage to see the finish on the car.</p>}
      <label className="mt-6 flex cursor-pointer items-center gap-3 text-[14px] text-drl-2">
        <input
          type="checkbox"
          checked={showLines}
          onChange={(e) => set({ showLines: e.target.checked })}
          className="h-4 w-4 accent-[#eef4ff]"
        />
        Show cut lines on the car
      </label>
    </div>
  );
}

/* ───────────── Tint ───────────── */
function TintStrip({
  value,
  onChange,
  label,
}: {
  value: TintShade;
  onChange: (v: TintShade) => void;
  label: string;
}) {
  const set = useStudio((s) => s.set);
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid grid-cols-7 gap-1"
      onMouseEnter={() => set({ testStrip: true })}
      onMouseLeave={() => set({ testStrip: false })}
    >
      {tintShades.map((v) => {
        const on = v === value;
        const dark = v === null ? 0 : 1 - Math.pow(v / 100, 0.75) * 1.05;
        return (
          <button
            key={String(v)}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={v === null ? "No film" : `${v} percent`}
            onClick={() => onChange(v)}
            onFocus={() => set({ testStrip: true })}
            onBlur={() => set({ testStrip: false })}
            className="group flex flex-col items-center gap-1.5"
          >
            <span
              aria-hidden
              className={clsx(
                "relative block h-12 w-full overflow-hidden rounded-md transition-transform duration-200",
                on ? "-translate-y-0.5" : "group-hover:-translate-y-0.5"
              )}
              style={{
                background:
                  v === null
                    ? "linear-gradient(160deg, rgb(150 175 210 / .35), rgb(150 175 210 / .1))"
                    : `linear-gradient(160deg, rgb(20 26 36 / ${0.35 + dark * 0.6}), rgb(4 6 10 / ${0.5 + dark * 0.5}))`,
                boxShadow: "inset 0 0 0 1px rgb(238 244 255 / .14), inset 0 10px 14px -10px rgb(255 255 255 / .25)",
              }}
            />
            <LampLine state={on ? "lit" : "dim"} className="w-full" />
            <span className={clsx("tnum text-[11.5px] font-semibold", on ? "text-drl" : "text-drl-dim")}>
              {v === null ? "None" : `${v}%`}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function TintPanel() {
  const windshield = useStudio((s) => s.windshield);
  const front = useStudio((s) => s.front);
  const rear = useStudio((s) => s.rear);
  const set = useStudio((s) => s.set);
  const illegal = front !== null && front < CA_FRONT_MIN_VLT;
  return (
    <div>
      <PanelHead
        title="Tint the glass"
        intro="Lower numbers are darker. Hover a strip and the car's side glass turns into a test strip of every shade."
      />
      <SubHead>Windshield</SubHead>
      <Segmented
        label="Windshield tint"
        value={windshield}
        onChange={(v) => set({ windshield: v })}
        options={windshieldOptions.map((w) => ({ id: w.id, label: w.name, note: w.price ? usd(w.price) : w.note }))}
      />
      <SubHead aside={front === null ? "No film" : `${front}% · ${usd(tintPrices.frontSides)}`}>Front side windows</SubHead>
      <TintStrip label="Front side window shade" value={front} onChange={(v) => set({ front: v })} />
      <p
        className={clsx(
          "mt-3 flex items-start gap-2.5 text-[13px] leading-snug transition-colors",
          illegal ? "text-amber" : "text-drl-dim"
        )}
        aria-live="polite"
      >
        <span
          aria-hidden
          className="mt-[5px] block h-2 w-2 shrink-0 rounded-full"
          style={illegal ? { background: "#ffab1f", boxShadow: "0 0 10px #ffab1f" } : { background: "rgb(238 244 255 / .2)" }}
        />
        {illegal
          ? `Darker than California allows on front side windows. The legal limit is ${CA_FRONT_MIN_VLT}% or lighter.`
          : `California allows ${CA_FRONT_MIN_VLT}% or lighter on the front side windows.`}
      </p>
      <SubHead aside={rear === null ? "No film" : `${rear}% · ${usd(tintPrices.rear)}`}>Rear side and back glass</SubHead>
      <TintStrip label="Rear window shade" value={rear} onChange={(v) => set({ rear: v })} />
      <SubHead>Popular combinations</SubHead>
      <div className="flex flex-wrap gap-2">
        {tintCombos.map((c) => {
          const on = front === c.front && rear === c.rear;
          return (
            <button
              key={c.name}
              type="button"
              onClick={() => set({ front: c.front, rear: c.rear })}
              className={clsx(
                "rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors",
                on ? "border-drl/70 bg-drl/[0.08] text-drl" : "border-[var(--line-2)] text-drl-2 hover:border-drl/40"
              )}
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────── Coat ───────────── */
export function CoatPanel() {
  const ceramic = useStudio((s) => s.ceramic);
  const setCeramic = useStudio((s) => s.setCeramic);
  const set = useStudio((s) => s.set);
  return (
    <div>
      <PanelHead
        title="Coat it in ceramic"
        intro="A hard, slick layer over paint and film. Deeper gloss, water beads off, and dirt washes away easier. Watch the light run down the car when you pick one."
      />
      <div role="radiogroup" aria-label="Ceramic coating" className="space-y-1">
        {ceramicTiers.map((t) => (
          <OptionRow
            key={t.years}
            selected={ceramic === t.years}
            onSelect={() => setCeramic(t.years)}
            title={t.name}
            note={t.note}
            aside={t.price ? usd(t.price) : undefined}
          />
        ))}
      </div>
      {ceramic > 0 && (
        <button
          type="button"
          onClick={() => set({ sweepAt: performance.now() })}
          className="mt-4 text-[13px] font-semibold text-drl-2 underline decoration-[var(--line-2)] hover:text-drl"
        >
          Run the light again
        </button>
      )}
    </div>
  );
}

/* ───────────── Light ───────────── */
function SceneGlyph({ id }: { id: SceneId }) {
  const c = { stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  return (
    <svg viewBox="0 0 40 28" className="h-7 w-10" aria-hidden>
      {id === "architecture" && <g {...c}><path d="M4 24h32M7 24V8M13 24V8M19 24V8M25 24V8M31 24V8M5 8h30" /></g>}
      {id === "track" && <g {...c}><path d="M3 24c8-2 12-12 20-12s10 6 14 6" /><path d="M30 4v8M30 4h6l-2 2 2 2h-6" /></g>}
      {id === "servicebay" && <g {...c}><path d="M4 24h32M8 24V10M32 24V10M8 14h24M12 14l3-4h10l3 4" /></g>}
      {id === "driveway" && <g {...c}><path d="M6 14l9-7 9 7v10H6zM12 24v-6h6v6M24 24l12 0M28 20h8" /></g>}
      {id === "studio" && <g {...c}><path d="M4 6h32M4 14h32M4 22h32" /></g>}
      {id === "bay" && <g {...c}><path d="M10 4l5 3v6l-5 3-5-3V7zM20 4l5 3v6l-5 3-5-3V7zM30 4l5 3v6l-5 3-5-3V7zM15 13l5 3v6l-5 3-5-3v-6zM25 13l5 3v6l-5 3-5-3v-6z" /></g>}
      {id === "night" && <g {...c}><circle cx="8" cy="6" r="2" fill="currentColor" /><circle cx="20" cy="6" r="2" fill="currentColor" /><circle cx="32" cy="6" r="2" fill="currentColor" /><path d="M3 22l34-2" /></g>}
    </svg>
  );
}

export function LightPanel() {
  const scene = useStudio((s) => s.scene);
  const set = useStudio((s) => s.set);
  return (
    <div>
      <PanelHead title="Change the light" intro="Film and coatings read differently in different light. Check it where you'll actually park." />
      <div role="radiogroup" aria-label="Lighting" className="space-y-1">
        {sceneList.map((s) => (
          <OptionRow
            key={s.id}
            selected={scene === s.id}
            onSelect={() => set({ scene: s.id })}
            title={s.name}
            note={s.note}
            aside={
              <span className={scene === s.id ? "text-drl" : "text-drl-dim"}>
                <SceneGlyph id={s.id} />
              </span>
            }
          />
        ))}
      </div>
    </div>
  );
}

/* ───────────── Review ───────────── */
function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };
  return { copied, copy };
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
}) {
  const cls =
    "mt-1.5 w-full rounded-lg border border-[var(--line-2)] bg-night/60 px-3 py-2.5 text-[15px] text-drl placeholder:text-drl-faint transition-colors focus:border-drl/60 focus:outline-none";
  return (
    <label className="block text-[13px] font-semibold text-drl-2">
      {label}
      {multiline ? (
        <textarea rows={3} className={cls} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type={type} className={cls} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

export function ReviewPanel() {
  const state = useStudio();
  const cfg = configOf(state);
  const car = carById(cfg.car);
  const paint = paintById(cfg.paint);
  const cov = coverageItems(cfg);
  const items = lineItems(cfg);
  const sum = total(cfg);
  const { copied, copy } = useCopy();
  const link = typeof window !== "undefined" ? `${window.location.origin}/studio?${shareQuery(cfg)}` : "";
  const h = state.handoff;
  const setH = (p: Partial<typeof h>) => state.set({ handoff: { ...h, ...p } });

  return (
    <div>
      <PanelHead title="Your build" intro={`${car.name} in ${paint.name}. The numbers match the pins on the car.`} />

      {cov.length > 0 ? (
        <ol className="mb-6 space-y-1.5">
          {cov.map((c) => (
            <li key={c.n} className="flex items-center gap-3 text-[14px] text-drl-2">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-drl/60 font-display text-[10.5px] font-bold text-drl">
                {c.n}
              </span>
              {c.label}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mb-6 text-[14px] text-drl-dim">Nothing added yet. Factory paint and glass, as delivered.</p>
      )}

      <div className="border-t border-[var(--line)] pt-4">
        {items.map((i) => (
          <div key={i.id} className="flex items-baseline justify-between gap-4 py-1.5 text-[14px]">
            <span className="text-drl-2">
              {i.label}
              <span className="block text-[12.5px] text-drl-dim">{i.detail}</span>
            </span>
            <span className="tnum font-semibold text-drl">{usd(i.price)}</span>
          </div>
        ))}
        <div className="mt-2 flex items-baseline justify-between border-t border-[var(--line)] pt-3">
          <span className="text-[14px] font-semibold text-drl-2">Estimated total</span>
          <span className="tnum font-display text-[24px] font-extrabold text-drl">{usd(sum)}</span>
        </div>
        <p className="mt-1.5 text-[12px] leading-relaxed text-drl-dim">{SAMPLE_PRICING_NOTE}</p>
      </div>

      {!state.showroom ? (
        <section className="mt-7">
          <h3 className="font-display text-[17px] font-extrabold text-drl">Send it to the store</h3>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-drl-dim">
            The link reopens this exact build, so whoever picks up the phone sees what you see.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <LampButton tone="ghost" className="!h-11 !px-3 text-[14px]" onClick={() => copy("link", link)}>
              {copied === "link" ? <Check size={16} /> : <Link2 size={16} />} {copied === "link" ? "Link copied" : "Copy link"}
            </LampButton>
            <LampButton tone="ghost" className="!h-11 !px-3 text-[14px]" onClick={() => copy("sum", buildSummary(cfg, { link }))}>
              {copied === "sum" ? <Check size={16} /> : <Copy size={16} />} {copied === "sum" ? "Copied" : "Copy summary"}
            </LampButton>
            <a
              href={`tel:${dealership.phone.tel}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--line-2)] text-[14px] font-semibold text-drl transition-colors hover:border-drl/60 hover:bg-drl/[0.06]"
            >
              <Phone size={16} /> {dealership.phone.display}
            </a>
            <LampButton tone="ghost" className="!h-11 !px-3 text-[14px]" onClick={() => window.print()}>
              <Printer size={16} /> Print sheet
            </LampButton>
          </div>
        </section>
      ) : (
        <section className="mt-7">
          <h3 className="font-display text-[17px] font-extrabold text-drl">Send to finance</h3>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-drl-dim">Your finance manager adds this to the deal.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="Customer name" value={h.customer} onChange={(v) => setH({ customer: v })} placeholder="Jordan Lee" />
            <Field label="Phone" type="tel" value={h.phone} onChange={(v) => setH({ phone: v })} placeholder="(925) 555-0142" />
            <Field label="Salesperson" value={h.salesperson} onChange={(v) => setH({ salesperson: v })} placeholder="Your name" />
            <Field label="Stock or deal #" value={h.stock} onChange={(v) => setH({ stock: v })} placeholder="P24117" />
          </div>
          <div className="mt-3">
            <Field label="Notes for finance" value={h.notes} onChange={(v) => setH({ notes: v })} placeholder="Optional" multiline />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <LampButton tone="primary" className="!h-11 text-[14px]" onClick={() => copy("fin", buildSummary(cfg, { link, handoff: h }))}>
              {copied === "fin" ? <Check size={16} /> : <Copy size={16} />} {copied === "fin" ? "Copied" : "Copy summary"}
            </LampButton>
            <a
              href={`mailto:${FINANCE_EMAIL}?subject=${encodeURIComponent(
                `Protection build: ${car.name}${h.stock ? ` · ${h.stock}` : ""}`
              )}&body=${encodeURIComponent(buildSummary(cfg, { link, handoff: h }))}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--line-2)] text-[14px] font-semibold text-drl transition-colors hover:border-drl/60 hover:bg-drl/[0.06]"
            >
              <Mail size={16} /> Open email
            </a>
          </div>
          <LampButton tone="quiet" className="mt-3 w-full text-[14px]" onClick={() => state.reset()}>
            <RotateCcw size={15} /> Next customer
          </LampButton>
        </section>
      )}
    </div>
  );
}

export const panels = {
  car: CarPanel,
  paint: PaintPanel,
  film: FilmPanel,
  tint: TintPanel,
  coat: CoatPanel,
  light: LightPanel,
  review: ReviewPanel,
};
