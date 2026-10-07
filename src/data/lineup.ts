import { dealership } from "./dealership";
import type { Loop } from "@/components/media/MotionPhoto";

const O = dealership.official;

export type Fuel = "Gasoline" | "Hybrid" | "Electric";

export type ModelLine = {
  id: string;
  name: string;
  styles: string[];
  /** Powertrains in the line, in the order porsche.com lists them. */
  fuels: Fuel[];
  line: string;
  /** Base MSRP as porsche.com/usa shows it; null when the line isn't taking new orders. */
  from: number | null;
  photo: { src: string; position?: string; alt: string };
  /** Porsche's card film for the line (5:4). */
  loop: Loop;
  /** Our own showroom film of the line, when we have one. It plays first; a click switches to Porsche's film. */
  showroom?: Loop & { car: string };
  /** Official model signature, with its viewBox size so every name renders at one shared scale. */
  signature: { src: string; w: number; h: number };
  newUrl: string;
  usedUrl: string;
};

/** Checked against porsche.com/usa on this date. */
export const PRICES_CHECKED = "October 5, 2026";
export const MSRP_NOTE =
  "Manufacturer's suggested retail price. Excludes options, taxes, title, registration, delivery, processing and handling fee, dealer charges and potential tariffs. Dealer sets actual selling price.";

// Model lines and body styles exactly as the official site's inventory menu lists them.
export const lineup: ModelLine[] = [
  {
    id: "911",
    name: "911",
    styles: ["911"],
    fuels: ["Gasoline"],
    line: "The rear-engine icon. Two doors, a 2+2 cabin and more than sixty years of refinement.",
    from: 135500,
    photo: { src: "/media/911-gts.jpg", position: "62% 60%", alt: "Porsche 911 Carrera GTS in dark grey on a mountain road at sunset" },
    loop: { src: "/media/card-911.mp4", poster: "/media/card-911.jpg" },
    showroom: { src: "/media/showroom-911.mp4", small: "/media/showroom-911-m.mp4", poster: "/media/showroom-911.jpg", car: "911 S/T" },
    signature: { src: "/media/signatures/911.svg", w: 94, h: 25 },
    newUrl: `${O}/new-vehicles/911-2/`,
    usedUrl: `${O}/used-vehicles/911-2/`,
  },
  {
    id: "718",
    name: "718",
    styles: ["Boxster", "Cayman", "Spyder"],
    fuels: ["Gasoline"],
    line: "Mid-engine balance, two doors and two seats. The cars on the lot are the cars there are.",
    from: null,
    photo: { src: "/media/718-gt4rs.jpg", position: "40% 60%", alt: "Porsche 718 Cayman GT4 RS in yellow on a desert road" },
    loop: { src: "/media/card-718.mp4", poster: "/media/card-718.jpg" },
    signature: { src: "/media/signatures/718.svg", w: 79, h: 26 },
    newUrl: `${O}/new-vehicles/718-cayman/`,
    usedUrl: `${O}/used-vehicles/cayman/`,
  },
  {
    id: "taycan",
    name: "Taycan",
    styles: ["All-electric"],
    fuels: ["Electric"],
    line: "An electric sports car with four doors and room for up to five.",
    from: 111900,
    photo: { src: "/media/taycan-ring.jpg", position: "60% 55%", alt: "Porsche Taycan Turbo GT cornering at the Nürburgring" },
    loop: { src: "/media/card-taycan.mp4", poster: "/media/card-taycan.jpg" },
    signature: { src: "/media/signatures/taycan.svg", w: 167, h: 36 },
    newUrl: `${O}/new-vehicles/taycan/`,
    usedUrl: `${O}/used-vehicles/taycan/`,
  },
  {
    id: "panamera",
    name: "Panamera",
    styles: ["Panamera"],
    fuels: ["Hybrid", "Gasoline"],
    line: "The long-distance sedan: four doors, up to five seats, and a cabin built for the whole drive.",
    from: 113000,
    photo: { src: "/media/panamera.jpg", position: "45% 70%", alt: "Porsche Panamera in copper by a marina" },
    loop: { src: "/media/card-panamera.mp4", poster: "/media/card-panamera.jpg" },
    signature: { src: "/media/signatures/panamera.svg", w: 260, h: 25 },
    newUrl: `${O}/new-vehicles/panamera/`,
    usedUrl: `${O}/used-vehicles/panamera/`,
  },
  {
    id: "macan",
    name: "Macan",
    styles: ["Macan", "All-electric Macan"],
    fuels: ["Electric", "Gasoline"],
    line: "The compact SUV that drives like a sports car, now electric as well as gasoline.",
    from: 65400,
    photo: { src: "/media/macan.jpg", position: "62% 62%", alt: "Porsche Macan Electric in dark purple on a desert road" },
    loop: { src: "/media/card-macan.mp4", poster: "/media/card-macan.jpg" },
    showroom: { src: "/media/showroom-macan.mp4", small: "/media/showroom-macan-m.mp4", poster: "/media/showroom-macan.jpg", car: "Macan GTS Electric" },
    signature: { src: "/media/signatures/macan.svg", w: 196, h: 26 },
    newUrl: `${O}/new-vehicles/macan/`,
    usedUrl: `${O}/used-vehicles/macan/`,
  },
  {
    id: "cayenne",
    name: "Cayenne",
    styles: ["Cayenne", "Cayenne Coupe"],
    fuels: ["Electric", "Hybrid", "Gasoline"],
    line: "Room for five and whatever the weekend needs, in all three powertrains.",
    from: 89900,
    photo: { src: "/media/cayenne-electric.jpg", position: "40% 62%", alt: "Porsche Cayenne Electric in olive green on a mountain road" },
    loop: { src: "/media/card-cayenne.mp4", poster: "/media/card-cayenne.jpg" },
    signature: { src: "/media/signatures/cayenne.svg", w: 245, h: 35 },
    newUrl: `${O}/new-vehicles/new-cayenne/`,
    usedUrl: `${O}/used-vehicles/cayenne/`,
  },
];
