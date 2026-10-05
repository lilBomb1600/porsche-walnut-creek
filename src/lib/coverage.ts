import type { AnchorId } from "@/data/cars";
import type { StudioConfig } from "@/data/protection";
import { ceramicTiers } from "@/data/protection";

export type CoverageItem = { n: number; anchor: AnchorId; label: string; group: "film" | "tint" | "coat" };

/** The numbered coverage map. The same numbers appear on the 3D car, the review list and the printed sheet. */
export function coverageItems(c: StudioConfig): CoverageItem[] {
  const out: Omit<CoverageItem, "n">[] = [];
  if (c.film === 4) out.push({ anchor: "roof", label: "Every painted panel", group: "film" });
  else if (c.film > 0) {
    const partial = c.film === 1;
    out.push({ anchor: "bumper", label: "Front bumper", group: "film" });
    out.push({ anchor: "hood", label: partial ? "Hood, first 24″" : "Full hood", group: "film" });
    out.push({ anchor: "fender", label: partial ? "Fenders, first 24″" : "Full fenders", group: "film" });
    out.push({ anchor: "mirror", label: "Mirror caps", group: "film" });
    if (c.film === 3) {
      out.push({ anchor: "rocker", label: "Rocker panels", group: "film" });
      out.push({ anchor: "apillar", label: "A-pillars", group: "film" });
    }
  }
  if (c.windshield === "strip") out.push({ anchor: "windshield", label: "Windshield, top 4″ strip", group: "tint" });
  if (c.windshield === "clear70") out.push({ anchor: "windshield", label: "Windshield, 70% clear", group: "tint" });
  if (c.front !== null) out.push({ anchor: "sideWindow", label: `Front side windows, ${c.front}%`, group: "tint" });
  if (c.rear !== null) out.push({ anchor: "rearWindow", label: `Rear windows, ${c.rear}%`, group: "tint" });
  if (c.ceramic > 0) {
    const t = ceramicTiers.find((x) => x.years === c.ceramic)!;
    out.push({ anchor: "body", label: `Ceramic, ${t.name.toLowerCase()}`, group: "coat" });
  }
  return out.map((o, i) => ({ ...o, n: i + 1 }));
}
