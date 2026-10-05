"use client";

import { create } from "zustand";
import type {
  CeramicTier,
  FilmFinish,
  FilmTier,
  StudioConfig,
  TintShade,
  WindshieldTint,
} from "@/data/protection";
import { tintShades } from "@/data/protection";
import { carById, cars } from "@/data/cars";
import { paints } from "@/data/paints";
import type { SceneId } from "@/three/Stage";

export type StepId = "car" | "paint" | "film" | "tint" | "coat" | "light" | "review";
export const steps: { id: StepId; label: string }[] = [
  { id: "car", label: "Car" },
  { id: "paint", label: "Paint" },
  { id: "film", label: "Film" },
  { id: "tint", label: "Tint" },
  { id: "coat", label: "Coat" },
  { id: "light", label: "Light" },
  { id: "review", label: "Review" },
];

export type ViewId = "orbit" | "front" | "side" | "rear" | "top";

export type Handoff = {
  customer: string;
  phone: string;
  salesperson: string;
  stock: string;
  notes: string;
};

type StudioState = StudioConfig & {
  step: StepId;
  visited: StepId[];
  scene: SceneId;
  view: ViewId;
  viewNonce: number;
  compare: boolean;
  split: number; // 0..1 across the canvas
  showLines: boolean;
  hoverTier: number;
  testStrip: boolean;
  sweepAt: number;
  showroom: boolean;
  handoff: Handoff;
  set: (p: Partial<StudioState>) => void;
  goStep: (s: StepId) => void;
  setView: (v: ViewId) => void;
  setPaint: (id: string) => void;
  setCar: (id: string) => void;
  setCeramic: (c: CeramicTier) => void;
  reset: () => void;
  applyQuery: (q: URLSearchParams) => void;
};

const baseConfig = (carId = "911"): StudioConfig => ({
  car: carId,
  paint: carById(carId).defaultPaint,
  film: 0,
  finish: "gloss",
  windshield: "none",
  front: null,
  rear: null,
  ceramic: 0,
});

const emptyHandoff: Handoff = { customer: "", phone: "", salesperson: "", stock: "", notes: "" };

export const useStudio = create<StudioState>((set, get) => ({
  ...baseConfig(),
  step: "paint",
  visited: ["car", "paint"],
  scene: "road",
  view: "orbit",
  viewNonce: 0,
  compare: false,
  split: 0.5,
  showLines: true,
  hoverTier: -1,
  testStrip: false,
  sweepAt: -1,
  showroom: false,
  handoff: emptyHandoff,
  set: (p) => set(p),
  goStep: (s) =>
    set((st) => {
      const view: ViewId | null =
        s === "film" ? "front" : s === "tint" ? "side" : s === "review" ? "top" : null;
      return {
        step: s,
        visited: st.visited.includes(s) ? st.visited : [...st.visited, s],
        ...(view ? { view, viewNonce: st.viewNonce + 1 } : {}),
      };
    }),
  setView: (v) => set((st) => ({ view: v, viewNonce: st.viewNonce + 1 })),
  setPaint: (id) => set({ paint: id }),
  setCar: (id) => set({ car: id, paint: carById(id).defaultPaint }),
  setCeramic: (c) => set({ ceramic: c, sweepAt: c > 0 ? performance.now() + 150 : get().sweepAt }),
  reset: () =>
    set((st) => ({
      ...baseConfig(st.car),
      step: "paint",
      visited: ["car", "paint"],
      compare: false,
      handoff: emptyHandoff,
      view: "orbit",
      viewNonce: st.viewNonce + 1,
    })),
  applyQuery: (q) => {
    const p: Partial<StudioState> = {};
    const car = q.get("car");
    if (car && cars.some((c) => c.id === car)) p.car = car;
    const paint = q.get("paint");
    if (paint && paints.some((x) => x.id === paint)) p.paint = paint;
    else if (p.car) p.paint = carById(p.car).defaultPaint;
    const film = Number(q.get("film"));
    if ([0, 1, 2, 3, 4].includes(film)) p.film = film as FilmTier;
    const finish = q.get("finish");
    if (finish === "gloss" || finish === "satin" || finish === "matte") p.finish = finish as FilmFinish;
    const ws = q.get("ws");
    if (ws === "none" || ws === "strip" || ws === "clear70") p.windshield = ws as WindshieldTint;
    const shade = (v: string | null): TintShade | undefined => {
      if (v === null) return undefined;
      if (v === "none") return null;
      const n = Number(v);
      return (tintShades as readonly (number | null)[]).includes(n) ? (n as TintShade) : undefined;
    };
    const fr = shade(q.get("front"));
    if (fr !== undefined) p.front = fr;
    const rr = shade(q.get("rear"));
    if (rr !== undefined) p.rear = rr;
    const coat = Number(q.get("coat"));
    if ([0, 3, 5, 7].includes(coat)) p.ceramic = coat as CeramicTier;
    if (q.get("mode") === "showroom") p.showroom = true;
    set(p);
  },
}));

export function configOf(s: StudioConfig): StudioConfig {
  return {
    car: s.car,
    paint: s.paint,
    film: s.film,
    finish: s.finish,
    windshield: s.windshield,
    front: s.front,
    rear: s.rear,
    ceramic: s.ceramic,
  };
}

/** Build configuration only. Never put customer details in a URL. */
export function shareQuery(c: StudioConfig) {
  const q = new URLSearchParams({
    car: c.car,
    paint: c.paint,
    film: String(c.film),
    finish: c.finish,
    ws: c.windshield,
    front: c.front === null ? "none" : String(c.front),
    rear: c.rear === null ? "none" : String(c.rear),
    coat: String(c.ceramic),
  });
  return q.toString();
}
