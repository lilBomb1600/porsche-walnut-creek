"use client";

import { Html } from "@react-three/drei";
import { useMemo } from "react";
import type { CarSpec } from "@/data/cars";
import { configOf, useStudio } from "@/lib/studio-store";
import { coverageItems } from "@/lib/coverage";

/** Numbered pins on the real panels, matching the review list one to one. */
export function CoveragePins({ spec }: { spec: CarSpec }) {
  const step = useStudio((s) => s.step);
  const film = useStudio((s) => s.film);
  const windshield = useStudio((s) => s.windshield);
  const front = useStudio((s) => s.front);
  const rear = useStudio((s) => s.rear);
  const ceramic = useStudio((s) => s.ceramic);
  const items = useMemo(
    () => coverageItems(configOf({ ...useStudio.getState(), film, windshield, front, rear, ceramic })),
    [film, windshield, front, rear, ceramic]
  );
  if (step !== "review") return null;
  return (
    <group scale={spec.scale}>
      <group position={spec.offset}>
        {items.map((it) => (
          <Html key={it.n} position={spec.anchors[it.anchor]} center zIndexRange={[10, 0]}>
            <span className="pin grid h-7 w-7 place-items-center rounded-full border border-drl/70 bg-night/85 font-display text-[11px] font-bold text-drl shadow-[0_0_14px_rgb(238_244_255/.45)]">
              {it.n}
            </span>
          </Html>
        ))}
      </group>
    </group>
  );
}
