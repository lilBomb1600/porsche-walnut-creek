/**
 * Shared, mutable state for the home page's scroll story. Read inside rAF/useFrame loops,
 * never through React state, so the 3D scene and the DOM rail stay frame-locked without re-renders.
 */
export const story = {
  loaded: false, // the page loader has given the green light
  ready: false, // the studio section is in view and its 3D intro may start
  reduced: false,
  introStart: -1, // performance.now() when the ignition intro began
  intro: 0, // 0..1
  p: 0, // scroll progress through the story section, 0..1
  pageP: 0, // scroll progress through the whole page, 0..1
  band: { x0: 0, x1: 0, y: 0, h: 18, ok: false }, // the car's light band, projected to screen px
};

export const INTRO_MS = 4300;

/** Story beats, as fractions of the story section. The rail lights one segment per beat. */
export const beats = [
  { id: "paint", label: "Paint", from: 0.12, to: 0.34 },
  { id: "film", label: "Film", from: 0.34, to: 0.56 },
  { id: "tint", label: "Tint", from: 0.56, to: 0.76 },
  { id: "coat", label: "Coat", from: 0.76, to: 0.93 },
] as const;

export const DOCK_END = 0.1;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const range = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
