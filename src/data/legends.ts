/**
 * Porsche legends with published specs (US ratings where they exist). Each carries a Porsche color for its card.
 * Sources: Porsche press releases as reported by motor1, autoguide, tflcar, thecarmagazine and Porsche dealer news pages.
 */
export type LegendCategory = "Hypercars" | "Motorsport" | "Today's icons" | "Origins";

export type Legend = {
  id: string;
  name: string;
  years: string;
  category: LegendCategory;
  stat: { value: string; unit: string };
  specs: [string, string][];
  story: string;
  color: string;
  /** Today's icons carry a photograph; a few also carry a loop of Porsche film. */
  media?: { src: string; alt: string; position?: string; loop?: { src: string; poster: string }; studio?: string };
};

export const legendCategories: LegendCategory[] = ["Hypercars", "Today's icons", "Motorsport", "Origins"];

export const legends: Legend[] = [
  {
    id: "918",
    name: "918 Spyder",
    years: "2013–2015",
    category: "Hypercars",
    stat: { value: "887", unit: "hp" },
    specs: [
      ["Powertrain", "4.6 L V8 + two electric motors"],
      ["0–60 mph", "2.5 s"],
      ["Nordschleife", "6:57 (2013)"],
      ["Built", "918 cars"],
    ],
    story: "A plug-in hybrid hypercar that proved electrification could make a Porsche faster, not just cleaner.",
    color: "#7fd0ff",
  },
  {
    id: "carrera-gt",
    name: "Carrera GT",
    years: "2003–2006",
    category: "Hypercars",
    stat: { value: "605", unit: "hp" },
    specs: [
      ["Engine", "5.7 L V10, mid-mounted"],
      ["Gearbox", "Six-speed manual"],
      ["0–60 mph", "3.5 s"],
      ["Built", "1,270 cars"],
    ],
    story: "A carbon-fiber V10 born from a Le Mans program, with a manual gearbox and a sound people still chase.",
    color: "#c9ced6",
  },
  {
    id: "959",
    name: "959",
    years: "1986–1988",
    category: "Hypercars",
    stat: { value: "444", unit: "hp" },
    specs: [
      ["Engine", "2.85 L twin-turbo flat-six"],
      ["Drive", "Electronically controlled all-wheel drive"],
      ["Paris–Dakar", "Overall win, 1986"],
    ],
    story: "The technology flagship of the 1980s. Its all-wheel drive and twin turbos shaped every 911 that followed.",
    color: "#f2f2f4",
  },
  {
    id: "turbo-s",
    name: "911 Turbo S",
    years: "2026",
    category: "Today's icons",
    stat: { value: "701", unit: "hp" },
    specs: [
      ["Powertrain", "T-Hybrid twin-turbo flat-six"],
      ["Torque", "590 lb-ft"],
      ["Distinction", "Most powerful production 911"],
    ],
    story: "Fifty years after the first 911 Turbo, the newest one goes hybrid and past 700 horsepower.",
    color: "#ff3348",
    media: {
      src: "/media/911-turbo-s.jpg",
      alt: "911 Turbo S in blue on a race track at sunset",
      position: "60% 62%",
      loop: { src: "/media/loop-turbo.mp4", poster: "/media/loop-turbo.jpg" },
    },
  },
  {
    id: "taycan-turbo-gt",
    name: "Taycan Turbo GT",
    years: "2025",
    category: "Today's icons",
    stat: { value: "1,092", unit: "hp" },
    specs: [
      ["Peak output", "With Launch Control"],
      ["Torque", "988 lb-ft"],
      ["Nordschleife", "7:07.55 (Weissach Package)"],
    ],
    story: "The most powerful production Porsche, and an electric sedan that laps the Nürburgring like a supercar.",
    color: "#00a4d6",
    media: { src: "/media/taycan-ring.jpg", alt: "Taycan Turbo GT cornering at the Nürburgring", position: "62% 58%" },
  },
  {
    id: "cayenne-turbo-gt",
    name: "Cayenne Turbo GT",
    years: "2022–",
    category: "Today's icons",
    stat: { value: "631", unit: "hp" },
    specs: [
      ["Engine", "4.0 L twin-turbo V8"],
      ["0–60 mph", "3.1 s"],
      ["Nordschleife", "7:38.9, an SUV record (2021)"],
    ],
    story: "The SUV that put its rivals on notice at the Ring, with a GT badge it earned on track.",
    color: "#f4c400",
    media: { src: "/media/cayenne-turbo-gt.jpg", alt: "Cayenne Turbo GT on a desert highway", position: "50% 62%" },
  },
  {
    id: "gt3-rs",
    name: "911 GT3 RS",
    years: "992",
    category: "Today's icons",
    stat: { value: "518", unit: "hp" },
    specs: [
      ["Engine", "4.0 L naturally aspirated flat-six"],
      ["Aero", "Active wing with drag reduction"],
      ["0–60 mph", "3.0 s"],
    ],
    story: "A road-legal race car whose wing is taller than the roof. Built for lap times, legal on the 680.",
    color: "#38a748",
    media: {
      src: "/media/gt3rs-track.jpg",
      alt: "911 GT3 RS in white with red wheels on a race track",
      position: "55% 62%",
      loop: { src: "/media/loop-gt3rs.mp4", poster: "/media/loop-gt3rs.jpg" },
    },
  },
  {
    id: "gt3",
    name: "911 GT3",
    years: "992",
    category: "Today's icons",
    stat: { value: "9,000", unit: "rpm" },
    specs: [
      ["Engine", "4.0 L naturally aspirated flat-six"],
      ["Output", "502 hp"],
      ["Gearbox", "PDK or six-speed manual"],
    ],
    story: "No turbos, no hybrid, a nine-thousand-rpm redline. The purist's 911.",
    color: "#e0501c",
    media: { src: "/media/gt3-studio.jpg", alt: "911 GT3 rendered in the Protection Studio", position: "50% 58%", studio: "/studio?car=gt3" },
  },
  {
    id: "919",
    name: "919 Hybrid",
    years: "2014–2017",
    category: "Motorsport",
    stat: { value: "3×", unit: "Le Mans" },
    specs: [
      ["Powertrain", "2.0 L turbo V4 + hybrid"],
      ["Le Mans", "Overall wins 2015, 2016, 2017"],
      ["919 Evo", "5:19.55 Nordschleife lap (2018)"],
    ],
    story: "Three straight Le Mans wins, then an unrestricted Evo version that set the fastest Nordschleife lap ever recorded at the time.",
    color: "#ffffff",
  },
  {
    id: "917",
    name: "917",
    years: "1969–1971",
    category: "Motorsport",
    stat: { value: "1970", unit: "Le Mans" },
    specs: [
      ["Engine", "Air-cooled flat-12"],
      ["Le Mans", "First overall win for Porsche"],
    ],
    story: "The car that won Porsche its first overall victory at Le Mans and became a legend in red-and-white and Gulf blue.",
    color: "#7fb1da",
  },
  {
    id: "356",
    name: "356",
    years: "1948–1965",
    category: "Origins",
    stat: { value: "No. 1", unit: "1948" },
    specs: [
      ["Engine", "Air-cooled flat-four, rear-mounted"],
      ["First registered", "June 8, 1948, Gmünd, Austria"],
    ],
    story: "The first car to wear the Porsche name. Light, efficient and rear-engined, the template for everything since.",
    color: "#d9d4c7",
  },
  {
    id: "911-1963",
    name: "901 / 911",
    years: "1963",
    category: "Origins",
    stat: { value: "1963", unit: "Frankfurt" },
    specs: [
      ["Engine", "Air-cooled flat-six"],
      ["Debut", "Frankfurt Motor Show, as the 901"],
      ["Milestone", "One-millionth 911 built in 2017"],
    ],
    story: "Shown as the 901 and renamed before sales began. More than sixty years later the silhouette is still the same idea.",
    color: "#2f8a52",
  },
];
