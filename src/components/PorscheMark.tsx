import Link from "next/link";
import clsx from "clsx";

/**
 * Centered dealer mark in the Porsche manner: wide, evenly tracked capitals with the store name beneath.
 * Set in type, not the factory wordmark artwork, so it can be swapped for the licensed logo file if the store approves.
 */
export function PorscheMark({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} aria-label="Porsche Walnut Creek, home" className={clsx("group flex flex-col items-center leading-none text-drl", className)}>
      <span className="font-mark pl-[0.34em] text-[15px] sm:text-[18px]">PORSCHE</span>
      <span className="mt-[5px] flex items-center gap-2 text-[8.5px] font-semibold tracking-[0.42em] text-drl-dim transition-colors duration-300 group-hover:text-drl-2 sm:text-[9px]">
        <span aria-hidden className="block h-px w-4 bg-gradient-to-r from-transparent to-[#ff3a4f]" />
        WALNUT CREEK
        <span aria-hidden className="block h-px w-4 bg-gradient-to-l from-transparent to-[#ff3a4f]" />
      </span>
    </Link>
  );
}
