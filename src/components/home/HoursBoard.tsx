"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import { dealership } from "@/data/dealership";
import { DAYS_SHORT, departmentStatus, fmtTime, storeNow, type OpenStatus } from "@/lib/hours";

const ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sun

/** Weekly hours with today's column lit, computed in Walnut Creek time. */
export function HoursBoard({ only }: { only?: Array<"sales" | "service" | "parts"> }) {
  const [today, setToday] = useState<number | null>(null);
  const [status, setStatus] = useState<Record<string, OpenStatus>>({});
  useEffect(() => {
    const now = storeNow();
    setToday(now.day);
    setStatus(Object.fromEntries(dealership.departments.map((d) => [d.id, departmentStatus(d, now)])));
  }, []);
  const deps = dealership.departments.filter((d) => !only || only.includes(d.id));

  return (
    <div className="overflow-x-auto">
      <table className="tnum w-full min-w-[560px] border-separate border-spacing-0 text-left">
        <caption className="sr-only">Store hours by department, Walnut Creek time</caption>
        <thead>
          <tr>
            <th scope="col" className="w-[120px] pb-3" />
            {ORDER.map((d) => (
              <th key={d} scope="col" className="pb-3 text-center">
                <span className={clsx("font-display text-[11px] font-bold tracking-[0.16em]", today === d ? "text-drl" : "text-drl-dim")}>
                  {DAYS_SHORT[d].toUpperCase()}
                </span>
                <span
                  aria-hidden
                  className={clsx("mx-auto mt-2 block h-[3px] w-[70%] rounded-full", today === d ? "" : "state-dim")}
                  style={today === d ? { background: "#f4f8ff", boxShadow: "0 0 8px rgb(238 244 255 / .9), 0 0 20px rgb(170 200 255 / .45)" } : undefined}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {deps.map((dep) => (
            <tr key={dep.id}>
              <th scope="row" className="border-t border-[var(--line)] py-4 pr-4 align-top">
                <span className="block text-[15px] font-semibold text-drl">{dep.name}</span>
                {status[dep.id] && (
                  <span className={clsx("mt-1 block text-[12.5px] font-medium", status[dep.id].open ? "text-drl-2" : "text-drl-dim")}>
                    {status[dep.id].open ? `Open until ${status[dep.id].label.split("until ")[1]}` : status[dep.id].label.replace(`${dep.name} `, "").replace(/^./, (c) => c.toUpperCase())}
                  </span>
                )}
              </th>
              {ORDER.map((d) => {
                const h = dep.week[d];
                return (
                  <td
                    key={d}
                    className={clsx(
                      "border-t border-[var(--line)] px-1 py-4 text-center align-top text-[12.5px] leading-snug",
                      today === d ? "text-drl" : "text-drl-dim"
                    )}
                  >
                    {h ? (
                      <>
                        {fmtTime(h.open).replace(":00", "")}
                        <br />
                        {fmtTime(h.close).replace(":00", "")}
                      </>
                    ) : (
                      <span className="line-through decoration-drl-faint">Closed</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
