"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

/**
 * A photograph that can come alive: when `active`, a short muted loop of Porsche film fades in over it.
 * The video file isn't requested until the first time it's needed, and reduced-motion visitors keep the still.
 */
export function MotionPhoto({
  src,
  alt,
  position = "50% 50%",
  loop,
  active = false,
  sizes = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 85vw",
  className,
  imgClassName,
  priority = false,
}: {
  src: string;
  alt: string;
  position?: string;
  loop?: { src: string; poster: string };
  active?: boolean;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (!loop || still) return;
    if (active) setArmed(true);
    const v = video.current;
    if (!v) return;
    if (active) {
      v.play().catch(() => {});
    } else {
      v.pause();
      setPlaying(false);
    }
  }, [active, armed, loop, still]);

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
      {loop && armed && (
        <video
          ref={video}
          src={loop.src}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
          className={clsx(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-[var(--ease-out-quart)]",
            playing && active ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  );
}
