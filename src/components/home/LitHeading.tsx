"use client";

import clsx from "clsx";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Ignite } from "@/components/fx/Ignite";

/**
 * Section headings ignite instead of sliding in: the words warm from dim to lamp white
 * while a lit line runs out beneath them. One motion, used for every section, in the world's own grammar.
 */
export function LitHeading({
  as: Tag = "h2",
  children,
  className,
  line = true,
}: {
  as?: "h2" | "h3";
  children: ReactNode;
  className?: string;
  line?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -18% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="lit-heading" data-on={on}>
      <Tag className={clsx(!className?.includes("font-mark-caps") && "font-livery", "text-balance text-drl", className)}>
        {typeof children === "string" ? <Ignite text={children} lit={on} stagger={18} /> : children}
      </Tag>
      {line && (
        <span
          aria-hidden
          className={clsx(
            "mt-6 block h-[3px] w-[min(240px,40vw)] origin-left rounded-full transition-transform duration-[1100ms] ease-[var(--ease-out-expo)]",
            on ? "scale-x-100" : "scale-x-0"
          )}
          style={{ background: "linear-gradient(180deg,#ff4a5c,#e8102a 55%,#a3061b)", boxShadow: "0 0 8px rgb(255 30 50 / .75), 0 0 20px rgb(232 16 42 / .4)" }}
        />
      )}
    </div>
  );
}
