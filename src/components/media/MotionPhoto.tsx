"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

export type Loop = {
  src: string;
  poster: string;
  /** A taller cut for phone-width cards (4:5), when the card changes shape below 640px. */
  small?: string;
};

/**
 * A photograph that can come alive: when `active`, a short muted film fades in over it. With several films,
 * `which` picks the one that plays. No file is requested until the first time it's needed, and
 * reduced-motion visitors keep the still.
 */
export function MotionPhoto({
  src,
  alt,
  position = "50% 50%",
  loop,
  loops,
  which = 0,
  active = false,
  sizes = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 85vw",
  className,
  imgClassName,
  priority = false,
}: {
  src: string;
  alt: string;
  position?: string;
  loop?: Loop;
  loops?: Loop[];
  which?: number;
  active?: boolean;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  const films = loops ?? (loop ? [loop] : []);
  const count = films.length;
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const shown = useRef(which);
  const [armed, setArmed] = useState<boolean[]>([]);
  const [playing, setPlaying] = useState<boolean[]>([]);
  const [still, setStill] = useState(false);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setNarrow(window.matchMedia("(max-width: 639px)").matches);
  }, []);

  useEffect(() => {
    if (!count || still) return;
    if (active && !armed[which]) {
      setArmed((a) => Object.assign([...a], { [which]: true }));
      return;
    }
    // a newly chosen film starts from its first frame
    if (shown.current !== which) {
      shown.current = which;
      const v = videos.current[which];
      if (v) v.currentTime = 0;
    }
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (active && i === which) v.play().catch(() => {});
      else v.pause();
    });
  }, [active, which, armed, count, still]);

  const setFlag = (i: number, on: boolean) => setPlaying((p) => (p[i] === on ? p : Object.assign([...p], { [i]: on })));

  return (
    <div className={clsx("relative overflow-hidden bg-night-3", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        srcSet={`${src.replace(/\.jpg$/, "-1200.jpg")} 1200w, ${src} 2400w`}
        alt={alt}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={clsx("absolute inset-0 h-full w-full object-cover", imgClassName)}
        style={{ objectPosition: position }}
      />
      {films.map((f, i) =>
        armed[i] ? (
          <video
            key={f.src}
            ref={(el) => void (videos.current[i] = el)}
            src={narrow && f.small ? f.small : f.src}
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
            tabIndex={-1}
            onPlaying={() => setFlag(i, true)}
            onPause={() => setFlag(i, false)}
            className={clsx(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-[var(--ease-out-quart)]",
              playing[i] && active && i === which ? "opacity-100" : "opacity-0"
            )}
          />
        ) : null
      )}
    </div>
  );
}
