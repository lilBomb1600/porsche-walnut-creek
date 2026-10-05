"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Bookmark, Phone, X } from "lucide-react";
import { PorscheMark } from "@/components/PorscheMark";
import { dealership } from "@/data/dealership";
import { departmentStatus } from "@/lib/hours";
import { DOCK_END, range, story } from "@/lib/story";
import { useRaf } from "@/lib/use-raf";

function UsFlag() {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] rounded-full" aria-hidden>
      <defs>
        <clipPath id="flag-c">
          <circle cx="12" cy="12" r="12" />
        </clipPath>
      </defs>
      <g clipPath="url(#flag-c)">
        <rect width="24" height="24" fill="#fff" />
        {[0, 2, 4, 6, 8, 10, 12].map((i) => (
          <rect key={i} y={i * (24 / 13) * 1} width="24" height={24 / 13} fill="#c8102e" transform={`translate(0 ${i * (24 / 13)})`} />
        ))}
        <rect width="11" height={(24 / 13) * 7} fill="#012169" />
        {Array.from({ length: 9 }).map((_, i) => (
          <circle key={i} cx={1.6 + (i % 3) * 3.6 + (Math.floor(i / 3) % 2) * 1.8} cy={1.8 + Math.floor(i / 3) * 3.6} r="0.55" fill="#fff" />
        ))}
      </g>
      <circle cx="12" cy="12" r="11.5" fill="none" stroke="rgb(255 255 255 / .35)" />
    </svg>
  );
}

const menuLinks = [
  { href: "/studio", label: "Protection Studio", note: "Paint, film, tint and coat on a live 911" },
  { href: "#lineup", label: "Models", note: "911, 718, Taycan, Panamera, Macan, Cayenne" },
  { href: "#history", label: "Heritage", note: "From the 356 to the Taycan" },
  { href: "#service", label: "Service", note: "Certified technicians, OEM parts, tires" },
  { href: "#buying", label: "Buying", note: "Porsche Approved, finance, trade-in" },
  { href: "#visit", label: "Visit", note: dealership.address.oneLine },
];

function Menu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<string | null>(null);
  useEffect(() => {
    setStatus(departmentStatus(dealership.departments[0]).label);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  const ease = [0.23, 1, 0.32, 1] as const;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[60] overflow-y-auto"
          initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
          animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
          exit={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.7, ease }}
        >
          <div className="absolute inset-0 bg-[#05070c]/92 backdrop-blur-2xl" />
          <div aria-hidden className="pointer-events-none absolute -left-40 top-1/3 h-[520px] w-[520px] rounded-full bg-[#e8102a]/20 blur-[120px]" />
          <div aria-hidden className="pointer-events-none absolute -right-32 bottom-0 h-[460px] w-[460px] rounded-full bg-[#0098c9]/15 blur-[120px]" />
          <div className="relative mx-auto flex min-h-full max-w-[1400px] flex-col px-5 pb-10 pt-5 sm:px-8">
            <div className="flex h-12 items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-2.5 rounded-full py-2 pl-2 pr-4 text-[14px] font-medium text-drl transition-colors hover:bg-white/[0.06]"
              >
                <X size={18} /> Close
              </button>
              <PorscheMark />
              <span className="w-[88px]" />
            </div>
            <div className="mt-10 grid flex-1 gap-14 lg:grid-cols-[1.4fr_1fr]">
              <nav aria-label="Menu">
                <ul>
                  {menuLinks.map((l, i) => (
                    <motion.li
                      key={l.href}
                      initial={reduce ? false : { opacity: 0, x: -28, filter: "blur(8px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      transition={{ delay: 0.18 + i * 0.06, duration: 0.6, ease }}
                      className="border-b border-white/[0.07]"
                    >
                      <Link
                        href={l.href}
                        onClick={onClose}
                        className="group flex items-center justify-between gap-6 py-4 sm:py-5"
                      >
                        <span>
                          <span className="font-livery block text-[clamp(30px,4.6vw,60px)] leading-[0.95] text-drl-2 transition-[color,transform] duration-300 group-hover:translate-x-2 group-hover:text-white">
                            {l.label}
                          </span>
                          <span className="mt-1.5 block text-[13.5px] text-drl-dim">{l.note}</span>
                        </span>
                        <ArrowRight className="shrink-0 -translate-x-3 text-[#ff3a4f] opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>
              <motion.aside
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.7, ease }}
                className="glass self-start rounded-3xl p-7"
              >
                <p className="font-livery text-[26px] leading-none text-white">Porsche Walnut Creek</p>
                <p className="mt-4 text-[14.5px] leading-relaxed text-white/75">
                  {dealership.address.oneLine}
                  <br />
                  {dealership.address.note}
                </p>
                {status && <p className="mt-4 text-[14px] font-medium text-white">{status}</p>}
                <div className="mt-6 grid gap-2">
                  <Link
                    href="/studio"
                    onClick={onClose}
                    className="sheen flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-white text-[14.5px] font-semibold text-night"
                  >
                    Build your protection <ArrowRight size={16} />
                  </Link>
                  <a
                    href={`tel:${dealership.phone.tel}`}
                    className="flex h-12 items-center justify-center gap-2 rounded-full text-[14.5px] font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/10"
                  >
                    <Phone size={16} /> {dealership.phone.display}
                  </a>
                </div>
                <div className="mt-6 grid gap-2.5 text-[14px]">
                  {[
                    { label: "New inventory", href: dealership.links.newInventory },
                    { label: "Pre-owned", href: dealership.links.usedInventory },
                    { label: "Schedule service", href: dealership.links.scheduleService },
                  ].map((x) => (
                    <a key={x.label} href={x.href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-white/80 hover:text-white">
                      {x.label} <ArrowUpRight size={15} />
                    </a>
                  ))}
                </div>
              </motion.aside>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Header in the Porsche manner: Menu on the left, the mark centered, saved build, region and call on the right.
 * Transparent over the hero; as the story starts it condenses into dark liquid glass, and its bottom
 * edge becomes the page's LED progress rail.
 */
export function SiteRail() {
  const header = useRef<HTMLElement>(null);
  const lit = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const st = useRef({ prog: 0, solid: 0, last: 0 });

  useRaf((now) => {
    const s = st.current;
    const dt = Math.min(0.05, s.last ? (now - s.last) / 1000 : 0.016);
    s.last = now;
    const k = 1 - Math.exp(-dt * 8);
    s.prog += (story.pageP - s.prog) * k;
    s.solid += (range(story.p, 0.01, DOCK_END) - s.solid) * k;
    const h = header.current;
    if (h) {
      const op = story.reduced ? 1 : range(story.intro, 0.86, 1);
      h.style.opacity = String(op);
      h.style.transform = `translate3d(0, ${(1 - op) * -16}px, 0)`;
      h.style.pointerEvents = op > 0.5 ? "auto" : "none";
      h.style.setProperty("--solid", String(s.solid));
    }
    if (lit.current) lit.current.style.transform = `scaleX(${Math.max(0.001, s.prog)})`;
  });

  const iconBtn =
    "grid h-10 w-10 place-items-center rounded-full text-drl-2 transition-[color,background-color,transform] duration-200 hover:bg-white/[0.08] hover:text-white active:scale-95";

  return (
    <>
      <header ref={header} className="site-header fixed inset-x-0 top-0 z-50 opacity-0">
        <div className="relative grid h-16 grid-cols-[1fr_auto_1fr] items-center px-3 sm:px-7">
          <div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              className="group flex items-center gap-3 rounded-full py-2 pl-2.5 pr-4 text-[14.5px] font-medium text-drl transition-colors hover:bg-white/[0.07]"
            >
              <span aria-hidden className="flex w-[18px] flex-col gap-[5px]">
                <span className="block h-[1.5px] w-full rounded bg-current transition-transform duration-300 group-hover:translate-x-0.5" />
                <span className="block h-[1.5px] w-3/4 rounded bg-current transition-[width] duration-300 group-hover:w-full" />
                <span className="block h-[1.5px] w-full rounded bg-current transition-transform duration-300 group-hover:-translate-x-0.5" />
              </span>
              Menu
            </button>
          </div>
          <PorscheMark />
          <div className="flex items-center justify-end gap-0.5 sm:gap-1.5">
            <Link href="/studio" aria-label="Your build in the studio" title="Your build" className={iconBtn}>
              <Bookmark size={19} strokeWidth={1.7} />
            </Link>
            <button type="button" aria-label="Region: United States, English" title="United States · English" className={clsx(iconBtn, "hidden sm:grid")}>
              <UsFlag />
            </button>
            <a href={`tel:${dealership.phone.tel}`} aria-label={`Call ${dealership.phone.display}`} title={dealership.phone.display} className={iconBtn}>
              <Phone size={18} strokeWidth={1.7} />
            </a>
          </div>
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/[0.06]" style={{ opacity: "var(--solid)" }} />
          <div ref={lit} aria-hidden className="led-strip absolute inset-x-0 -bottom-px h-[2px] origin-left" style={{ transform: "scaleX(0)" }} />
        </div>
      </header>
      <Menu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
