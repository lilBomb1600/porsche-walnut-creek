import { carById } from "@/data/cars";
import { paintById } from "@/data/paints";
import { SAMPLE_PRICING_NOTE, lineItems, total, usd, type StudioConfig } from "@/data/protection";
import { coverageItems } from "./coverage";
import type { Handoff } from "./studio-store";

/** Finance inbox for showroom mode. Leave empty and the mail app opens with no recipient. */
export const FINANCE_EMAIL = "";

export function buildSummary(c: StudioConfig, opts: { link?: string; handoff?: Handoff } = {}) {
  const car = carById(c.car);
  const paint = paintById(c.paint);
  const lines: string[] = [];
  lines.push("PORSCHE WALNUT CREEK · PROTECTION BUILD");
  lines.push(`Vehicle: ${car.name}, ${paint.name}`);
  const h = opts.handoff;
  if (h) {
    if (h.customer) lines.push(`Customer: ${h.customer}`);
    if (h.phone) lines.push(`Phone: ${h.phone}`);
    if (h.salesperson) lines.push(`Salesperson: ${h.salesperson}`);
    if (h.stock) lines.push(`Stock / deal #: ${h.stock}`);
  }
  lines.push("");
  const cov = coverageItems(c);
  if (cov.length) {
    lines.push("Coverage map");
    cov.forEach((i) => lines.push(`  ${i.n}. ${i.label}`));
    lines.push("");
  }
  const items = lineItems(c);
  if (items.length) {
    items.forEach((i) => lines.push(`${i.label} (${i.detail}): ${usd(i.price)}`));
  } else lines.push("No protection selected yet.");
  lines.push(`Estimated total: ${usd(total(c))}`);
  lines.push(SAMPLE_PRICING_NOTE);
  if (h?.notes) {
    lines.push("");
    lines.push(`Notes: ${h.notes}`);
  }
  if (opts.link) {
    lines.push("");
    lines.push(`Reopen this build: ${opts.link}`);
  }
  return lines.join("\n");
}
