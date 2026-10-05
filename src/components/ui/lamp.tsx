"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";

/**
 * Line-form state, the system's only state language:
 * lit = solid lamp line, available = dim dashed line, struck = disabled.
 */
export function LampLine({
  state,
  className,
  tone = "white",
}: {
  state: "lit" | "dim" | "struck";
  className?: string;
  tone?: "white" | "red" | "amber";
}) {
  const litColor = tone === "red" ? "#ff2a3f" : tone === "amber" ? "#ffab1f" : "#eef4ff";
  const glow =
    tone === "red"
      ? "0 0 8px rgb(255 30 50 / .9), 0 0 18px rgb(232 16 42 / .5)"
      : tone === "amber"
      ? "0 0 8px rgb(255 171 31 / .9), 0 0 18px rgb(255 171 31 / .45)"
      : "0 0 8px rgb(238 244 255 / .85), 0 0 18px rgb(170 200 255 / .4)";
  return (
    <span
      aria-hidden
      className={clsx("block h-[3px] rounded-full transition-[background-color,box-shadow,opacity] duration-300", state === "dim" && "state-dim", className)}
      style={
        state === "lit"
          ? { background: litColor, boxShadow: glow }
          : state === "struck"
          ? { background: "rgb(238 244 255 / .12)" }
          : undefined
      }
    />
  );
}

type BtnTone = "primary" | "ghost" | "quiet";

/** Primary controls lean a few pixels toward the pointer, then spring back. Fine pointers only. */
function useMagnetic<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * 0.18;
      const y = (e.clientY - (r.top + r.height / 2)) * 0.28;
      el.style.transition = "transform 120ms var(--ease-out-quart)";
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const leave = () => {
      el.style.transition = "transform 500ms cubic-bezier(0.23, 1, 0.32, 1)";
      el.style.transform = "";
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [enabled]);
  return ref;
}

const btnBase =
  "group relative inline-flex select-none items-center justify-center gap-2.5 rounded-full font-sans text-[15px] font-semibold tracking-[0.005em] transition-[transform,background-color,color,box-shadow,border-color] duration-200 ease-[var(--ease-out-quart)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40";

const tones: Record<BtnTone, string> = {
  primary:
    "h-12 px-6 bg-drl text-night hover:bg-white shadow-[0_0_0_1px_rgb(238_244_255/.4),0_8px_30px_-8px_rgb(170_200_255/.55)] hover:shadow-[0_0_0_1px_rgb(255_255_255/.7),0_10px_40px_-6px_rgb(190_215_255/.75)]",
  ghost:
    "h-12 px-6 text-drl border border-[var(--line-2)] hover:border-drl/60 hover:bg-drl/[0.06]",
  quiet: "h-10 px-4 text-drl-2 hover:text-drl hover:bg-drl/[0.06]",
};

export function LampButton({
  tone = "primary",
  className,
  children,
  ...rest
}: ComponentProps<"button"> & { tone?: BtnTone }) {
  const ref = useMagnetic<HTMLButtonElement>(tone === "primary");
  return (
    <button ref={ref} className={clsx(btnBase, tones[tone], tone === "primary" && "sheen overflow-hidden", className)} {...rest}>
      {children}
    </button>
  );
}

export function LampLink({
  tone = "primary",
  className,
  children,
  href,
  external,
  ...rest
}: Omit<ComponentProps<"a">, "href"> & { tone?: BtnTone; href: string; external?: boolean }) {
  const cls = clsx(btnBase, tones[tone], tone === "primary" && "sheen overflow-hidden", className);
  const ref = useMagnetic<HTMLAnchorElement>(tone === "primary");
  if (external || href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:"))
    return (
      <a
        ref={ref}
        href={href}
        className={cls}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  return (
    <Link ref={ref} href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}

/** A selectable row. The leading lamp line carries its state; no colored side borders. */
export function OptionRow({
  selected,
  onSelect,
  onHover,
  title,
  note,
  aside,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  onHover?: (on: boolean) => void;
  title: ReactNode;
  note?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      onFocus={() => onHover?.(true)}
      onBlur={() => onHover?.(false)}
      className={clsx(
        "group grid w-full grid-cols-[28px_1fr_auto] items-center gap-x-3 rounded-xl px-3 py-3.5 text-left transition-colors duration-200",
        selected ? "bg-drl/[0.07]" : "hover:bg-drl/[0.035]"
      )}
    >
      <LampLine state={selected ? "lit" : "dim"} className="w-7 self-center" />
      <span className="min-w-0">
        <span className={clsx("block text-[15px] font-semibold", selected ? "text-drl" : "text-drl-2")}>{title}</span>
        {note && <span className="mt-0.5 block text-[13px] leading-snug text-drl-dim">{note}</span>}
        {children}
      </span>
      {aside && <span className="tnum text-[14px] font-semibold text-drl-2">{aside}</span>}
    </button>
  );
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: { id: T; label: ReactNode; note?: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={clsx("grid gap-1.5", className)} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={String(o.id)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.id)}
            className={clsx(
              "relative flex flex-col items-start gap-2 rounded-xl px-3 pb-3 pt-2.5 text-left transition-colors duration-200",
              on ? "bg-drl/[0.08]" : "hover:bg-drl/[0.04]"
            )}
          >
            <LampLine state={on ? "lit" : "dim"} className="w-full" />
            <span className={clsx("text-[14px] font-semibold leading-tight", on ? "text-drl" : "text-drl-2")}>{o.label}</span>
            {o.note && <span className="text-[12px] leading-tight text-drl-dim">{o.note}</span>}
          </button>
        );
      })}
    </div>
  );
}
