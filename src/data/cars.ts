/**
 * The studio garage. Adding a car is a drop-in: put the .glb in public/models,
 * measure its bounds once, and describe its materials and protection zones here.
 * All zone values are in the model's own space (front of car = +z).
 */
export type CarZones = {
  frontZ: number;
  rearZ: number;
  partialZ: number; // film boundary for bumper + first 24" of hood/fenders
  fullZ: number; // film boundary for full hood + fenders
  mirrorMin: [number, number, number]; // |x|, y, z
  mirrorMax: [number, number, number];
  rocker: [number, number, number, number]; // yMax, |x|min, zMin, zMax
  apA: [number, number, number]; // A-pillar capsule, |x| space
  apB: [number, number, number];
  apR: number;
  bPillarZ: number; // side glass ahead of this z = front windows
  stripY: number; // windshield sun-strip starts above this y
  sideMinZ: number;
  sideMaxZ: number;
  wsZ: number; // combined glass: windshield ahead of this z
  sideAbsX: number; // combined glass: side windows beyond this |x|
};

export type AnchorId =
  | "bumper"
  | "hood"
  | "fender"
  | "mirror"
  | "rocker"
  | "apillar"
  | "roof"
  | "windshield"
  | "sideWindow"
  | "rearWindow"
  | "body";

export type CarSpec = {
  id: string;
  name: string;
  year: string;
  short: string;
  file: string;
  scale: number;
  offset: [number, number, number]; // applied in model units before scale
  defaultPaint: string;
  materials: {
    paint: string[];
    hide?: string[];
    hideMaterials?: string[];
    windshield?: string; // mesh name
    rearWindow?: string;
    sideWindows?: string;
    frontLights?: string[]; // mesh names that glow white
    tailLights?: string[]; // mesh names that glow red
    band?: string; // the light band across the tail
    glassMaterial?: string; // one combined glass material, classified by position
    lampMaterials?: string[]; // materials that glow (front white, rear red)
    plates?: string[];
  };
  zones: CarZones;
  bandAnchor: [number, number, number];
  /** Pin anchors for the numbered coverage map (model space, left side = +x). */
  anchors: Record<AnchorId, [number, number, number]>;
  /** Lamp centers for glow halos and light spill (model space). */
  glow: { tail: [number, number, number][]; band?: [number, number, number]; head: [number, number, number][] };
  credit: { title: string; author: string; license: string; licenseUrl: string; source: string };
};

export const cars: CarSpec[] = [
  {
    id: "911",
    name: "911 Carrera 4S",
    year: "991",
    short: "911 C4S",
    file: "/models/911-carrera-4s.glb",
    scale: 1,
    offset: [0, 0.633, -0.076],
    defaultPaint: "guards-red",
    materials: {
      paint: ["paint"],
      hide: ["boot.011_0", "boot.011_0.001"],
      windshield: "windshield_0",
      rearWindow: "window_rear_0",
      sideWindows: "boot.004_0",
      frontLights: ["bumper_front.001_2", "bumper_front.004_1"],
      tailLights: ["Plane.001_0", "boot.003_0"],
      band: "boot.003_0",
      plates: ["Plane.005_0", "Plane.006_0"],
    },
    zones: {
      frontZ: 2.267,
      rearZ: -2.115,
      partialZ: 1.36,
      fullZ: 0.9,
      mirrorMin: [0.83, 0.12, 0.46],
      mirrorMax: [1.2, 0.36, 0.84],
      rocker: [-0.3, 0.72, -0.86, 0.92],
      apA: [0.665, 0.215, 0.92],
      apB: [0.575, 0.55, 0.25],
      apR: 0.07,
      bPillarZ: -0.41,
      stripY: 0.468,
      sideMinZ: -1.07,
      sideMaxZ: 0.39,
      wsZ: 0.2,
      sideAbsX: 0.7,
    },
    bandAnchor: [0, 0.062, -2.05],
    glow: {
      tail: [
        [-0.62, 0.06, -1.99],
        [0.62, 0.06, -1.99],
      ],
      band: [0, 0.062, -2.07],
      head: [
        [-0.63, 0.04, 1.76],
        [0.63, 0.04, 1.76],
      ],
    },
    anchors: {
      bumper: [0, -0.16, 2.24],
      hood: [0, 0.07, 1.62],
      fender: [0.86, 0.04, 1.42],
      mirror: [0.97, 0.25, 0.64],
      rocker: [0.9, -0.39, 0.38],
      apillar: [0.63, 0.39, 0.6],
      roof: [0, 0.6, -0.3],
      windshield: [0, 0.42, 0.56],
      sideWindow: [0.75, 0.37, -0.28],
      rearWindow: [0, 0.43, -1.26],
      body: [-0.93, 0.12, -0.92],
    },
    credit: {
      title: "(FREE) Porsche 911 Carrera 4S",
      author: "Karol Miklas",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      source: "https://sketchfab.com/3d-models/free-porsche-911-carrera-4s-d01b254483794de3819786d93e0e1ebf",
    },
  },
  {
    id: "930",
    name: "911 Turbo (930)",
    year: "1975",
    short: "930 Turbo",
    file: "/models/930-turbo.glb",
    scale: 0.88,
    offset: [0, 0, -0.207],
    defaultPaint: "gt-silver",
    materials: {
      paint: ["paint"],
      hideMaterials: ["Material.001", "DefaultMaterial"],
      glassMaterial: "glass",
      lampMaterials: ["930_lights"],
      plates: [],
    },
    zones: {
      frontZ: 2.651,
      rearZ: -2.237,
      partialZ: 1.8,
      fullZ: 1.06,
      mirrorMin: [0.82, 0.86, 0.78],
      mirrorMax: [1.3, 1.08, 1.12],
      rocker: [0.4, 0.82, -0.62, 1.12],
      apA: [0.73, 0.94, 1.0],
      apB: [0.62, 1.37, 0.36],
      apR: 0.075,
      bPillarZ: -0.2,
      stripY: 1.27,
      sideMinZ: -1.2,
      sideMaxZ: 0.9,
      wsZ: 0.0,
      sideAbsX: 0.64,
    },
    bandAnchor: [0, 0.45, -2.13],
    glow: {
      tail: [
        [-0.62, 0.56, -2.14],
        [0.62, 0.56, -2.14],
      ],
      band: [0, 0.5, -2.15],
      head: [
        [-0.64, 0.66, 2.5],
        [0.64, 0.66, 2.5],
      ],
    },
    anchors: {
      bumper: [0, 0.36, 2.62],
      hood: [0, 0.76, 1.9],
      fender: [0.92, 0.72, 1.6],
      mirror: [0.97, 0.98, 0.95],
      rocker: [0.98, 0.3, 0.2],
      apillar: [0.69, 1.16, 0.7],
      roof: [0, 1.42, -0.3],
      windshield: [0, 1.16, 0.6],
      sideWindow: [0.79, 1.15, 0.0],
      rearWindow: [0, 1.22, -0.9],
      body: [-1.02, 0.76, -1.2],
    },
    credit: {
      title: "FREE 1975 Porsche 911 (930) Turbo",
      author: "Lionsharp Studios",
      license: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      source: "https://sketchfab.com/3d-models/free-1975-porsche-911-930-turbo-8568d9d14a994b9cae59499f0dbed21e",
    },
  },
];

export const carById = (id: string) => cars.find((c) => c.id === id) ?? cars[0];

export const hdriCredits = [
  { name: "Studio Small 09", url: "https://polyhaven.com/a/studio_small_09" },
  { name: "Kloofendal 48d Partly Cloudy (Pure Sky)", url: "https://polyhaven.com/a/kloofendal_48d_partly_cloudy_puresky" },
  { name: "Potsdamer Platz", url: "https://polyhaven.com/a/potsdamer_platz" },
  { name: "Rooftop Night", url: "https://polyhaven.com/a/rooftop_night" },
];
