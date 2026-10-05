/**
 * Exterior colors and option groups exactly as Porsche's US configurator lists them for the
 * 2027 911 Carrera 4S (checked 2026-10-04). Swatch tones were sampled from the configurator's
 * own swatches: `hi` is the lit side, `avg` the overall tone, `lo` the shadow side.
 * Paint to Sample is a selection from Porsche's 147 historical colors; those tones are approximate.
 */
export type PaintGroup = "Contrasts" | "Shades" | "Dreams" | "Legends" | "Paint to Sample";

export type Paint = {
  id: string;
  name: string;
  group: PaintGroup;
  hex: string; // base color for the 3D paint
  hi: string;
  avg: string;
  lo: string;
  metallic?: boolean;
};

type Raw = Omit<Paint, "hi" | "avg" | "lo"> & { hi?: string; avg?: string; lo?: string };

const raw: Raw[] = [
  { id: "white", name: "White", group: "Contrasts", hex: "#eceeec", hi: "#dfe3e1", avg: "#c7ccca", lo: "#aaaead" },
  { id: "black", name: "Black", group: "Contrasts", hex: "#0b0b0d", hi: "#28272e", avg: "#212124", lo: "#09090b" },

  { id: "jet-black", name: "Jet Black Metallic", group: "Shades", hex: "#17171c", hi: "#2a2931", avg: "#232227", lo: "#0a090d", metallic: true },
  { id: "vanadium-grey", name: "Vanadium Grey Metallic", group: "Shades", hex: "#5d636c", hi: "#9fa7b2", avg: "#6a7079", lo: "#30383c", metallic: true },
  { id: "gt-silver", name: "GT Silver Metallic", group: "Shades", hex: "#a9a9ab", hi: "#f2f2f4", avg: "#a9a9ab", lo: "#525155", metallic: true },
  { id: "ice-grey", name: "Ice Grey Metallic", group: "Shades", hex: "#a3a6ab", hi: "#cecdd1", avg: "#a9abb0", lo: "#81858a", metallic: true },

  { id: "guards-red", name: "Guards Red", group: "Dreams", hex: "#ad1d2a", hi: "#b2202f", avg: "#a21c26", lo: "#890610" },
  { id: "gentian-blue", name: "Gentian Blue Metallic", group: "Dreams", hex: "#23305f", hi: "#263572", avg: "#21294b", lo: "#08091b", metallic: true },
  { id: "carmine-red", name: "Carmine Red", group: "Dreams", hex: "#871e2b", hi: "#8c202d", avg: "#7f1c28", lo: "#680613" },
  { id: "cartagena-yellow", name: "Cartagena Yellow Metallic", group: "Dreams", hex: "#c2c47a", hi: "#cbcd81", avg: "#b6b970", lo: "#999b5a", metallic: true },
  { id: "provence", name: "Provence", group: "Dreams", hex: "#59535c", hi: "#5c5660", avg: "#544f56", lo: "#433e44" },
  { id: "lugano-blue", name: "Lugano Blue", group: "Dreams", hex: "#213f70", hi: "#244274", avg: "#1e3c6b", lo: "#072b56" },

  { id: "oak-green", name: "Oak Green Metallic Neo", group: "Legends", hex: "#314231", hi: "#354a35", avg: "#2b382c", lo: "#121912", metallic: true },
  { id: "aventurine-green", name: "Aventurine Green Metallic", group: "Legends", hex: "#727068", hi: "#86847b", avg: "#5b5c56", lo: "#262926", metallic: true },
  { id: "shade-green", name: "Shade Green Metallic", group: "Legends", hex: "#7e8888", hi: "#838d8d", avg: "#767f80", lo: "#606a6a", metallic: true },
  { id: "slate-grey", name: "Slate Grey Neo", group: "Legends", hex: "#46494e", hi: "#494c51", avg: "#424649", lo: "#323538" },
  { id: "chalk", name: "Chalk", group: "Legends", hex: "#b4b2ab", hi: "#b3b0aa", avg: "#9b9893", lo: "#757670" },

  { id: "riviera-blue", name: "Riviera Blue", group: "Paint to Sample", hex: "#0a92c6" },
  { id: "miami-blue", name: "Miami Blue", group: "Paint to Sample", hex: "#0098c9" },
  { id: "gulf-blue", name: "Gulf Blue", group: "Paint to Sample", hex: "#76a7cf" },
  { id: "mexico-blue", name: "Mexico Blue", group: "Paint to Sample", hex: "#1a54a3" },
  { id: "shark-blue", name: "Shark Blue", group: "Paint to Sample", hex: "#1c519c" },
  { id: "voodoo-blue", name: "Voodoo Blue", group: "Paint to Sample", hex: "#202f62" },
  { id: "python-green", name: "Python Green", group: "Paint to Sample", hex: "#32a043" },
  { id: "viper-green", name: "Viper Green", group: "Paint to Sample", hex: "#58a83c" },
  { id: "signal-green", name: "Signal Green", group: "Paint to Sample", hex: "#1b8146" },
  { id: "irish-green", name: "Irish Green", group: "Paint to Sample", hex: "#1d4630" },
  { id: "racing-yellow", name: "Racing Yellow", group: "Paint to Sample", hex: "#ecb800" },
  { id: "speed-yellow", name: "Speed Yellow", group: "Paint to Sample", hex: "#f0cc00" },
  { id: "lava-orange", name: "Lava Orange", group: "Paint to Sample", hex: "#d94b1a" },
  { id: "rubystone-red", name: "Rubystone Red", group: "Paint to Sample", hex: "#b81857" },
  { id: "ultraviolet", name: "Ultraviolet", group: "Paint to Sample", hex: "#452870" },
  { id: "arctic-grey", name: "Arctic Grey", group: "Paint to Sample", hex: "#a9aeb1" },
  { id: "crayon", name: "Crayon", group: "Paint to Sample", hex: "#b2b2ab" },
  { id: "fashion-grey", name: "Fashion Grey", group: "Paint to Sample", hex: "#9d9b93" },
];

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(amt >= 0 ? c + (255 - c) * amt : c * (1 + amt))
  );
  return "#" + ch.map((c) => Math.min(255, Math.max(0, c)).toString(16).padStart(2, "0")).join("");
}

export const paints: Paint[] = raw.map((p) => ({
  ...p,
  hi: p.hi ?? shade(p.hex, 0.12),
  avg: p.avg ?? p.hex,
  lo: p.lo ?? shade(p.hex, -0.45),
}));

export const paintGroups: { id: PaintGroup; price: string; note?: string }[] = [
  { id: "Contrasts", price: "$0" },
  { id: "Shades", price: "$880" },
  { id: "Dreams", price: "$1,580" },
  { id: "Legends", price: "$3,160" },
  { id: "Paint to Sample", price: "$15,050", note: "A selection from 147 historical Porsche colors" },
];

export const PAINT_PRICE_NOTE = "Paint prices are Porsche MSRP for a 2027 911 Carrera 4S (porsche.com). Protection prices in this studio are samples.";

/** The configurator's swatch: a folded paint sample, lit from the upper left with a soft streak across the fold. */
export function swatchBackground(p: Paint) {
  const streak = shade(p.avg, p.metallic ? 0.32 : 0.18);
  return `linear-gradient(135deg, ${p.hi} 0%, ${p.avg} 34%, ${streak} 47%, ${p.avg} 56%, ${p.lo} 100%)`;
}

export const paintById = (id: string) => paints.find((p) => p.id === id) ?? paints.find((p) => p.id === "guards-red")!;
