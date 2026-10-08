"use client";

import clsx from "clsx";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export type SwipeRailHandle = { step: (dir: 1 | -1) => void; el: HTMLDivElement | null };

/**
 * A row you move sideways yourself: swipe on a phone, two-finger scroll or shift-wheel on a trackpad, drag with a
 * mouse, or the arrow buttons. It snaps card to card and never takes over the page's vertical scroll.
 */
export const SwipeRail = forwardRef<
  SwipeRailHandle,
  {
    children: ReactNode;
    label: string;
    className?: string;
    /** called with the scroll position (0..1) and the rail element on every scroll */
    onScroll?: (p: number, el: HTMLDivElement) => void;
  }
>(function SwipeRail({ children, label, className, onScroll }, ref) {
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const swallowClick = useRef(false);
  const cb = useRef(onScroll);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    cb.current = onScroll;
  }, [onScroll]);

  useEffect(() => {
    const el = rail.current!;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = el.scrollWidth - el.clientWidth;
      const start = el.scrollLeft < 4;
      const end = el.scrollLeft > max - 4;
      setEdge((e) => (e.start === start && e.end === end ? e : { start, end }));
      cb.current?.(max > 0 ? el.scrollLeft / max : 0, el);
    };
    const onScrollEvt = () => (raf ||= requestAnimationFrame(update));
    update();
    el.addEventListener("scroll", onScrollEvt, { passive: true });
    const ro = new ResizeObserver(onScrollEvt);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScrollEvt);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const step = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const w = first ? first.getBoundingClientRect().width + gap : el.clientWidth * 0.8;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * w, behavior: reduce ? "auto" : "smooth" });
  };

  useImperativeHandle(ref, () => ({ step, el: rail.current }));

  // mouse drag; touch and trackpads scroll natively
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.dataset.dragging = "true";
    }
    if (d.moved) e.currentTarget.scrollLeft = d.left - dx;
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    swallowClick.current = true;
    window.setTimeout(() => (swallowClick.current = false), 0);
    delete e.currentTarget.dataset.dragging;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      ref={rail}
      role="region"
      aria-label={label}
      tabIndex={0}
      data-lenis-prevent-horizontal
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={(e) => {
        if (swallowClick.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      data-start={edge.start}
      data-end={edge.end}
      className={clsx("swipe-rail no-scrollbar", className)}
    >
      {children}
    </div>
  );
});

/** Previous / next buttons for a SwipeRail. */
export function RailArrows({ onStep, start, end, className }: { onStep: (dir: 1 | -1) => void; start: boolean; end: boolean; className?: string }) {
  const btn =
    "glass grid h-11 w-11 place-items-center rounded-full text-white transition-[opacity,transform] duration-300 ease-[var(--ease-out-quart)] hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-30";
  return (
    <div className={clsx("flex gap-2", className)}>
      <button type="button" aria-label="Previous" disabled={start} onClick={() => onStep(-1)} className={btn}>
        <ArrowLeft size={18} />
      </button>
      <button type="button" aria-label="Next" disabled={end} onClick={() => onStep(1)} className={btn}>
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
