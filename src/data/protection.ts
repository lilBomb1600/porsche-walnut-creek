// SAMPLE menu pricing for the demo. Not Porsche Walnut Creek's real prices; the finance office sets the final price.
export const SAMPLE_PRICING_NOTE =
  "Sample menu pricing for this demo. Your finance office sets the final price.";

export type FilmTier = 0 | 1 | 2 | 3 | 4;

export const filmTiers: {
  tier: FilmTier;
  name: string;
  covers: string;
  price: number;
}[] = [
  { tier: 0, name: "No film", covers: "Factory paint only", price: 0 },
  { tier: 1, name: "Partial front", covers: "Bumper, first 24″ of hood and fenders, mirrors", price: 1395 },
  { tier: 2, name: "Full front", covers: "Full hood and fenders, bumper, mirrors", price: 2295 },
  { tier: 3, name: "Track", covers: "Full front plus rocker panels and A-pillars", price: 3295 },
  { tier: 4, name: "Full body", covers: "Every painted panel", price: 6495 },
];

export type FilmFinish = "gloss" | "satin" | "matte";

export const filmFinishes: { id: FilmFinish; name: string; note: string; uplift: number }[] = [
  { id: "gloss", name: "Gloss", note: "Deeper shine than factory", uplift: 0 },
  { id: "satin", name: "Satin", note: "Soft, low sheen", uplift: 0.15 },
  { id: "matte", name: "Matte", note: "Flat stealth look", uplift: 0.15 },
];

// Visible light transmission. Lower number = darker film. null = no film.
export const tintShades = [null, 70, 50, 35, 20, 15, 5] as const;
export type TintShade = (typeof tintShades)[number];

export type WindshieldTint = "none" | "strip" | "clear70";
export const windshieldOptions: { id: WindshieldTint; name: string; note: string; price: number }[] = [
  { id: "none", name: "None", note: "Factory glass", price: 0 },
  { id: "strip", name: "Top 4″ strip", note: "Sun visor band", price: 95 },
  { id: "clear70", name: "70% clear", note: "Heat and UV, nearly invisible", price: 395 },
];

export const tintPrices = { frontSides: 195, rear: 295 };

// California Vehicle Code: front side windows must let in at least 70% of light.
export const CA_FRONT_MIN_VLT = 70;

export const tintCombos: { name: string; front: TintShade; rear: TintShade }[] = [
  { name: "70% front, 20% rear", front: 70, rear: 20 },
  { name: "70% front, 5% rear", front: 70, rear: 5 },
  { name: "70% all around", front: 70, rear: 70 },
];

export type CeramicTier = 0 | 3 | 5 | 7;
export const ceramicTiers: { years: CeramicTier; name: string; note: string; price: number }[] = [
  { years: 0, name: "None", note: "Factory clearcoat", price: 0 },
  { years: 3, name: "3-year coating", note: "Gloss, water beading, easier washing", price: 895 },
  { years: 5, name: "5-year coating", note: "Thicker layer, more chemical resistance", price: 1395 },
  { years: 7, name: "7-year coating", note: "Our longest-lasting protection", price: 1895 },
];

export type StudioConfig = {
  car: string;
  paint: string;
  film: FilmTier;
  finish: FilmFinish;
  windshield: WindshieldTint;
  front: TintShade;
  rear: TintShade;
  ceramic: CeramicTier;
};

export type LineItem = { id: string; label: string; detail: string; price: number };

export function lineItems(c: StudioConfig): LineItem[] {
  const items: LineItem[] = [];
  const tier = filmTiers.find((t) => t.tier === c.film)!;
  if (c.film > 0) {
    const finish = filmFinishes.find((f) => f.id === c.finish)!;
    items.push({
      id: "film",
      label: "Paint protection film",
      detail: `${tier.name}, ${finish.name.toLowerCase()} finish`,
      price: Math.round((tier.price * (1 + finish.uplift)) / 5) * 5,
    });
  }
  const ws = windshieldOptions.find((w) => w.id === c.windshield)!;
  if (ws.price > 0) items.push({ id: "windshield", label: "Windshield tint", detail: ws.name, price: ws.price });
  if (c.front !== null)
    items.push({ id: "front", label: "Front side windows", detail: `${c.front}% film`, price: tintPrices.frontSides });
  if (c.rear !== null)
    items.push({ id: "rear", label: "Rear windows", detail: `${c.rear}% film`, price: tintPrices.rear });
  const coat = ceramicTiers.find((t) => t.years === c.ceramic)!;
  if (coat.price > 0) items.push({ id: "ceramic", label: "Ceramic coating", detail: coat.name, price: coat.price });
  return items;
}

export const total = (c: StudioConfig) => lineItems(c).reduce((s, i) => s + i.price, 0);

export const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
