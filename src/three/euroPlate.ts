import * as THREE from "three";

/**
 * German-format registration plates, drawn on a canvas: 520 x 110 mm, the blue EU band with its ring of stars
 * and "D", and the city code split from the letters by the two round seals (inspection sticker over the state seal),
 * the way Porsche's own press cars wear "S" for Stuttgart. Text like "S·PW 911": the dot marks where the seals sit.
 */

const W = 1040; // 2 px per mm
const H = 220;
const BAND = 92; // 46 mm blue band

function plateFamily() {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--font-archivo").trim();
  return v || "'Arial Narrow', Arial, sans-serif";
}

function draw(c: HTMLCanvasElement, text: string) {
  const g = c.getContext("2d")! as CanvasRenderingContext2D & { fontStretch: string };
  g.clearRect(0, 0, W, H);
  g.fontStretch = "normal";

  // plate body with a pressed black rim
  const r = 14;
  g.fillStyle = "#101114";
  g.beginPath();
  g.roundRect(0, 0, W, H, r);
  g.fill();
  const face = g.createLinearGradient(0, 0, 0, H);
  face.addColorStop(0, "#fbfbf8");
  face.addColorStop(1, "#ecece7");
  g.fillStyle = face;
  g.beginPath();
  g.roundRect(5, 5, W - 10, H - 10, r - 4);
  g.fill();

  // EU band
  g.fillStyle = "#003399";
  g.beginPath();
  g.roundRect(5, 5, BAND, H - 10, [r - 4, 0, 0, r - 4]);
  g.fill();
  g.fillStyle = "#ffcc00";
  const cx = 5 + BAND / 2;
  const cy = 64;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    star(g, cx + Math.cos(a) * 27, cy + Math.sin(a) * 27, 6.2);
  }
  g.fillStyle = "#ffffff";
  g.font = `600 64px ${plateFamily()}`;
  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  g.fillText("D", cx, H - 30);

  // lettering: DIN-style condensed, fitted to the field
  const [city, rest] = text.split("·");
  const family = plateFamily();
  g.fillStyle = "#111214";
  g.textAlign = "left";
  g.textBaseline = "alphabetic";
  const size = 196;
  g.fontStretch = "condensed";
  g.font = `600 ${size}px ${family}`;
  const sealGap = 64;
  const cityW = g.measureText(city).width;
  const restW = g.measureText(rest ?? "").width;
  const field = W - BAND - 70;
  const natural = cityW + sealGap + restW;
  const sx = Math.min(0.9, field / natural); // tall, narrow letters like the real plate
  const total = natural * sx;
  const x0 = BAND + 5 + (W - BAND - 5 - total) / 2;
  const base = H / 2 + size * 0.355;
  g.save();
  g.translate(x0, base);
  g.scale(sx, 1);
  g.fillText(city, 0, 0);
  g.fillText(rest ?? "", cityW + sealGap, 0);
  g.restore();

  // seals: the inspection sticker above the state seal
  const sxp = x0 + (cityW + sealGap / 2) * sx;
  seal(g, sxp, H / 2 - 32, 24, "#e94e8a", "#b8336a"); // inspection sticker
  seal(g, sxp, H / 2 + 32, 24, "#cfd2d6", "#8d939b"); // state seal
}

function star(g: CanvasRenderingContext2D, x: number, y: number, rad: number) {
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? rad : rad * 0.42;
    g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  g.closePath();
  g.fill();
}

function seal(g: CanvasRenderingContext2D, x: number, y: number, rad: number, fill: string, ring: string) {
  const grd = g.createRadialGradient(x - rad * 0.3, y - rad * 0.3, 1, x, y, rad);
  grd.addColorStop(0, "#ffffff");
  grd.addColorStop(0.25, fill);
  grd.addColorStop(1, ring);
  g.fillStyle = grd;
  g.beginPath();
  g.arc(x, y, rad, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "rgb(0 0 0 / .25)";
  g.lineWidth = 2;
  g.stroke();
}

export function makeEuroPlateTexture(text: string) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  draw(c, text);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  // redraw once the display face has loaded, so the canvas never keeps the fallback lettering
  document.fonts?.load(`600 196px ${plateFamily()}`).then(() => {
    draw(c, text);
    t.needsUpdate = true;
  });
  return t;
}

/** Plate size in metres. */
export const PLATE_SIZE = { w: 0.52, h: 0.11 };
