import Link from "next/link";
import clsx from "clsx";

/**
 * The Porsche wordmark (as used on porsche.com) with the store name beneath.
 * Porsche and the Porsche wordmark are trademarks of Dr. Ing. h.c. F. Porsche AG; used here for a
 * Porsche Walnut Creek concept, pending the store's approval.
 */
const WORDMARK =
  "M502 221c48.1 0 74-25.9 74-74V74c0-48.1-25.9-74-74-74H0v300h68v-79h434zm6-143v65c0 7.8-4.2 12-12 12H68V66h428c7.8 0 12 4.2 12 12zm228 222c-48.1 0-74-25.9-74-74V74c0-48.1 25.9-74 74-74h417c48.1 0 74 25.9 74 74v152c0 48.1-25.9 74-74 74H736zm411-66c7.8 0 12-4.2 12-12V78c0-7.8-4.2-12-12-12H742c-7.8 0-12 4.2-12 12v144c0 7.8 4.2 12 12 12h405zm675-36c39.844 16.757 67.853 56.1 68 102h-68c0-54-25-79-79-79h-361v79h-68V0h502c48.1 0 74 25.9 74 74v50.14c0 46.06-23.75 71.76-68 73.86zm-12-43c7.8 0 12-4.2 12-12V78c0-7.8-4.2-12-12-12h-428v89h428zm162-81c0-48.1 25.9-74 74-74h492v56h-486c-7.8 0-12 4.2-12 12v42c0 7.8 4.2 12 12 12h422c48.1 0 74 25.9 74 74v30c0 48.1-25.9 74-74 74h-492v-56h486c7.8 0 12-4.2 12-12v-42c0-7.8-4.2-12-12-12h-422c-48.1 0-74-25.9-74-74V74zm661 0c0-48.1 25.9-74 74-74h480v66h-474c-7.8 0-12 4.2-12 12v144c0 7.8 4.2 12 12 12h474v66h-480c-48.1 0-74-25.9-74-74V74zM3817 0v300h-68V183h-407v117h-68V0h68v117h407V0h68zm156 56v66h527v56h-527v66h527v56h-595V0h595v56h-527z";

export function PorscheWordmark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 4500 300" className={className} fill="currentColor" role="img" aria-label="Porsche">
      <path d={WORDMARK} />
    </svg>
  );
}

export function PorscheMark({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} aria-label="Porsche Walnut Creek, home" className={clsx("group flex flex-col items-center leading-none text-drl", className)}>
      <PorscheWordmark className="h-[9px] w-auto transition-opacity duration-300 group-hover:opacity-85 sm:h-[12px]" />
      <span className="mt-[7px] flex items-center gap-2 text-[8.5px] font-semibold tracking-[0.42em] text-drl-dim transition-colors duration-300 group-hover:text-drl-2 sm:text-[9px]">
        <span aria-hidden className="block h-px w-4 bg-gradient-to-r from-transparent to-[#ff3a4f]" />
        WALNUT CREEK
        <span aria-hidden className="block h-px w-4 bg-gradient-to-l from-transparent to-[#ff3a4f]" />
      </span>
    </Link>
  );
}
