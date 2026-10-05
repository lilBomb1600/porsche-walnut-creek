import Link from "next/link";
import clsx from "clsx";

/** Dealer name on one line, plain type. Never the factory crest or wordmark artwork. */
export function Wordmark({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      aria-label="Porsche Walnut Creek, home"
      className={clsx("group inline-flex items-center gap-2.5 whitespace-nowrap text-drl", className)}
    >
      <span
        aria-hidden
        className="block h-[3px] w-5 rounded-full transition-[width] duration-300 group-hover:w-7"
        style={{ background: "linear-gradient(180deg,#ff6070,#e8102a 60%,#a3061b)", boxShadow: "0 0 8px rgb(255 30 50 / .8)" }}
      />
      <span className="font-display wdth-112 text-[14.5px] font-bold tracking-[0.01em] sm:text-[15px]">Porsche Walnut Creek</span>
    </Link>
  );
}
