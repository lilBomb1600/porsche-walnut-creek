"use client";

import { useEffect, useRef } from "react";

/** Runs cb every animation frame while mounted. */
export function useRaf(cb: (now: number) => void) {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    let id = 0;
    const loop = (t: number) => {
      ref.current(t);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);
}
