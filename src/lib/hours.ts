import type { DayHours, Department } from "@/data/dealership";

export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Current day index and minutes since midnight in Walnut Creek, whatever the visitor's timezone. */
export function storeNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = DAYS_SHORT.indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export function fmtTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function fmtRange(d: DayHours) {
  return d ? `${fmtTime(d.open)} – ${fmtTime(d.close)}` : "Closed";
}

export type OpenStatus = { open: boolean; label: string };

export function departmentStatus(dep: Department, now = storeNow()): OpenStatus {
  const today = dep.week[now.day];
  if (today && now.minutes >= toMin(today.open) && now.minutes < toMin(today.close)) {
    return { open: true, label: `${dep.name} open until ${fmtTime(today.close)}` };
  }
  if (today && now.minutes < toMin(today.open)) {
    return { open: false, label: `${dep.name} opens today at ${fmtTime(today.open)}` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = (now.day + i) % 7;
    const h = dep.week[d];
    if (h) return { open: false, label: `${dep.name} opens ${i === 1 ? "tomorrow" : DAYS[d]} at ${fmtTime(h.open)}` };
  }
  return { open: false, label: `${dep.name} closed` };
}
