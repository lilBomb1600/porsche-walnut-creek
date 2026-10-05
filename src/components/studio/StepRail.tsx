"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { steps, useStudio } from "@/lib/studio-store";

/**
 * Configurator step tabs. A glowing pill glides to the active step, finished steps carry a
 * check, and a hairline beneath fills with red LED light as the build progresses.
 */
export function StepRail({ className }: { className?: string }) {
  const step = useStudio((s) => s.step);
  const visited = useStudio((s) => s.visited);
  const goStep = useStudio((s) => s.goStep);
  const reduce = useReducedMotion();
  const idx = steps.findIndex((s) => s.id === step);
  const progress = (idx + 1) / steps.length;
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 420, damping: 38, mass: 0.9 };

  return (
    <nav aria-label="Studio steps" className={clsx("relative w-full", className)}>
      <ol className="no-scrollbar flex w-full items-stretch gap-0.5 overflow-x-auto">
        {steps.map((s, i) => {
          const active = s.id === step;
          const done = visited.includes(s.id) && i < idx;
          return (
            <li key={s.id} className="relative shrink-0 sm:flex-1">
              <button
                type="button"
                onClick={() => goStep(s.id)}
                aria-current={active ? "step" : undefined}
                className={clsx(
                  "group relative flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors duration-200 sm:px-2",
                  active ? "text-night" : done ? "text-drl hover:text-white" : "text-drl-dim hover:text-drl"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="step-pill"
                    transition={spring}
                    className="absolute inset-0 rounded-full bg-drl shadow-[0_0_0_1px_rgb(255_255_255/.6),0_6px_24px_-6px_rgb(190_215_255/.75)]"
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {done && <Check size={13} strokeWidth={2.6} className="text-[#ff5263]" />}
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="relative mt-2 h-[2px] overflow-hidden rounded-full bg-white/[0.07]">
        <motion.div
          className="led-strip absolute inset-y-0 left-0 rounded-full"
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 26 }}
        />
      </div>
    </nav>
  );
}
