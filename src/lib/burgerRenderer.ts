import { burgerLayers } from "../data/content";

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Deterministic pseudo-random in [-1, 1] from an integer seed. */
const seeded = (n: number) => (Math.sin(n * 12.9898) * 43758.5453) % 1;

export type BurgerRenderOptions = {
  width: number;
  height: number;
  /** 0 = fully assembled burger, 1 = maximum explosion */
  progress: number;
  /** seconds, for idle float/steam animation */
  time: number;
  /** 0 disables floating idle motion (used once explosion begins) */
  idleStrength?: number;
  reducedMotion?: boolean;
};

function hexToRgb(hex: string) {
  const v = hex.replace("#", "");
  const num = parseInt(v, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function shadeColor(hex: string, amt: number) {
  const { r, g, b } = hexToRgb(hex);
  const clampC = (c: number) => clamp(Math.round(c + amt * 255), 0, 255);
  return `rgb(${clampC(r)}, ${clampC(g)}, ${clampC(b)})`;
}

// ---------------------------------------------------------------------------
// Organic shapes: real food is never a perfect rounded rectangle. Every solid
// layer is built from a noisy ring of points, smoothed through their
// midpoints so the outline reads as an irregular, hand-shaped blob instead
// of a geometric "emoji" icon.
// ---------------------------------------------------------------------------

type Pt = { x: number; y: number };

function noisyRingPoints(cx: number, cy: number, rx: number, ry: number, seed: number, n: number, roughness: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 1 + seeded(seed + i * 3.13) * roughness + seeded(seed + i * 7.77 + 1) * roughness * 0.5;
    pts.push({ x: cx + Math.cos(a) * rx * r, y: cy + Math.sin(a) * ry * r });
  }
  return pts;
}

function pathSmoothClosed(ctx: CanvasRenderingContext2D, pts: Pt[]) {
  const n = pts.length;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const p0 = pts[i];
    const p1 = pts[(i + 1) % n];
    const mx = (p0.x + p1.x) / 2;
    const my = (p0.y + p1.y) / 2;
    if (i === 0) ctx.moveTo(mx, my);
    else ctx.quadraticCurveTo(p0.x, p0.y, mx, my);
  }
  ctx.closePath();
}

function pathSmoothOpen(ctx: CanvasRenderingContext2D, pts: Pt[], startAt: Pt) {
  ctx.moveTo(startAt.x, startAt.y);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const mx = (p0.x + p1.x) / 2;
    const my = (p0.y + p1.y) / 2;
    ctx.quadraticCurveTo(p0.x, p0.y, mx, my);
  }
  ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
}

function fillWithLight(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  base: string,
  accent: string,
) {
  const grad = ctx.createLinearGradient(cx - w / 2, cy - h / 2, cx + w * 0.18, cy + h / 2);
  grad.addColorStop(0, accent);
  grad.addColorStop(0.5, base);
  grad.addColorStop(1, shadeColor(base, -0.28));
  ctx.fillStyle = grad;
  ctx.fill();
}

/** A small soft glossy highlight — the thing that makes food photography read as "wet/fresh". */
function drawSpecular(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, alpha: number, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(rx, ry));
  grad.addColorStop(0, `rgba(255, 250, 235, ${alpha})`);
  grad.addColorStop(1, "rgba(255, 250, 235, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Soft dark mottling — char marks, toasted patches — using multiply so it reads as burnt, not painted. */
function drawMottling(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, seed: number, count: number, color: string) {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  for (let i = 0; i < count; i++) {
    const x = cx + seeded(seed + i * 4.1) * w * 0.4;
    const y = cy + seeded(seed + i * 6.3 + 2) * h * 0.4;
    const r = w * (0.06 + Math.abs(seeded(seed + i * 2.7)) * 0.08);
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, color);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.7, seeded(seed + i) * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBun(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  base: string,
  accent: string,
  top: boolean,
  seedBase: number,
) {
  ctx.save();
  if (top) {
    const domePts = noisyRingPoints(cx, cy - h * 0.05, w / 2, h * 1.5, seedBase, 20, 0.045).filter((p) => p.y <= cy + h * 0.55);
    const baseL = { x: cx - w / 2, y: cy + h * 0.5 };
    const baseR = { x: cx + w / 2, y: cy + h * 0.5 };
    ctx.beginPath();
    ctx.moveTo(baseL.x, baseL.y);
    pathSmoothOpen(ctx, domePts, baseL);
    ctx.lineTo(baseR.x, baseR.y);
    ctx.closePath();
    fillWithLight(ctx, cx, cy - h * 0.25, w, h * 1.9, base, accent);

    drawMottling(ctx, cx, cy - h * 0.15, w, h, seedBase + 40, 4, "rgba(120, 60, 20, 0.35)");
    drawSpecular(ctx, cx - w * 0.14, cy - h * 0.55, w * 0.22, h * 0.5, 0.5);

    ctx.fillStyle = "rgba(255, 246, 224, 0.92)";
    for (let i = 0; i < 13; i++) {
      const t = i / 12;
      const sx = cx + lerp(-w * 0.34, w * 0.34, t) + seeded(seedBase + i) * 6;
      const sy = cy - h * 0.55 + Math.abs(t - 0.5) * h * 0.95 + seeded(seedBase + i * 3) * 3;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(seeded(seedBase + i * 5));
      ctx.beginPath();
      ctx.ellipse(0, 0, 3, 1.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else {
    const pts = noisyRingPoints(cx, cy, w / 2, h, seedBase, 18, 0.035);
    pathSmoothClosed(ctx, pts);
    fillWithLight(ctx, cx, cy, w, h, base, accent);
    drawMottling(ctx, cx, cy + h * 0.2, w, h, seedBase + 20, 3, "rgba(100, 50, 15, 0.3)");
  }
  ctx.restore();
}

function drawPatty(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, base: string, accent: string, seedBase: number) {
  const pts = noisyRingPoints(cx, cy, w / 2, h, seedBase, 22, 0.1);
  pathSmoothClosed(ctx, pts);
  fillWithLight(ctx, cx, cy, w, h, base, accent);

  drawMottling(ctx, cx, cy, w, h, seedBase, 7, "rgba(30, 12, 4, 0.4)");

  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = shadeColor(base, -0.4);
  ctx.lineWidth = Math.max(1.5, h * 0.1);
  ctx.lineCap = "round";
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.32 + seeded(seedBase + i) * 6, cy + i * h * 0.2);
    ctx.quadraticCurveTo(cx, cy + i * h * 0.2 + h * 0.08, cx + w * 0.32, cy + i * h * 0.2 - h * 0.1);
    ctx.stroke();
  }
  ctx.restore();

  drawSpecular(ctx, cx + w * 0.12, cy - h * 0.1, w * 0.1, h * 0.4, 0.22);
  drawSpecular(ctx, cx - w * 0.2, cy + h * 0.15, w * 0.06, h * 0.25, 0.18);
}

function drawCheese(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, base: string, accent: string, seedBase: number) {
  const dripCount = 7;
  const top: Pt[] = [
    { x: cx - w / 2, y: cy - h / 2 },
    { x: cx + w / 2, y: cy - h / 2 },
  ];
  const drips: Pt[] = [];
  for (let i = dripCount; i >= 0; i--) {
    const t = i / dripCount;
    const x = cx - w / 2 + t * w;
    const drip = (Math.sin(i * 2.4 + seedBase) * 0.5 + 0.5) * h * 0.95;
    drips.push({ x, y: cy + h * 0.22 + drip });
  }

  ctx.beginPath();
  ctx.moveTo(top[0].x, top[0].y);
  ctx.lineTo(top[1].x, top[1].y);
  ctx.lineTo(drips[0].x, drips[0].y);
  for (let i = 0; i < drips.length - 1; i++) {
    const p0 = drips[i];
    const p1 = drips[i + 1];
    const mx = (p0.x + p1.x) / 2;
    const my = (p0.y + p1.y) / 2;
    ctx.quadraticCurveTo(p0.x, p0.y, mx, my);
  }
  ctx.lineTo(drips[drips.length - 1].x, drips[drips.length - 1].y);
  ctx.closePath();
  fillWithLight(ctx, cx, cy, w * 1.02, h * 1.7, base, accent);

  ctx.save();
  const sheen = ctx.createLinearGradient(cx - w / 2, cy - h / 2, cx + w / 2, cy - h * 0.1);
  sheen.addColorStop(0, "rgba(255, 250, 220, 0)");
  sheen.addColorStop(0.5, "rgba(255, 250, 220, 0.45)");
  sheen.addColorStop(1, "rgba(255, 250, 220, 0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(cx - w / 2, cy - h / 2, w, h * 0.5);
  ctx.restore();
}

function drawLettuce(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, base: string, accent: string, seedBase: number) {
  const n = 14;
  const top: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = cx - w / 2 + t * w;
    const ruffle =
      Math.abs(Math.sin(i * 1.3 + seedBase)) * h * 0.35 + Math.abs(Math.sin(i * 3.1 + seedBase * 0.5)) * h * 0.18;
    top.push({ x, y: cy - h * 0.15 - ruffle });
  }
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, cy + h / 2);
  ctx.lineTo(top[0].x, top[0].y);
  for (let i = 0; i < top.length - 1; i++) {
    const p0 = top[i];
    const p1 = top[i + 1];
    const mx = (p0.x + p1.x) / 2;
    const my = (p0.y + p1.y) / 2;
    ctx.quadraticCurveTo(p0.x, p0.y, mx, my);
  }
  ctx.lineTo(cx + w / 2, cy + h / 2);
  ctx.closePath();
  fillWithLight(ctx, cx, cy, w, h * 1.3, base, accent);

  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = shadeColor(base, -0.3);
  ctx.lineWidth = 1;
  for (let i = 1; i < n; i += 2) {
    const p = top[i];
    ctx.beginPath();
    ctx.moveTo(p.x, p.y + 2);
    ctx.lineTo(p.x + seeded(seedBase + i) * 4, cy + h * 0.3);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSauce(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, base: string, accent: string, seedBase: number) {
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.beginPath();
  const waves = 9;
  for (let i = 0; i <= waves; i++) {
    const t = i / waves;
    const x = cx - w / 2 + t * w;
    const y = cy + Math.sin(i * 1.4 + seedBase) * h * 0.5;
    if (i === 0) ctx.moveTo(x, y - h * 0.4);
    else ctx.lineTo(x, y - h * 0.4);
  }
  for (let i = waves; i >= 0; i--) {
    const t = i / waves;
    const x = cx - w / 2 + t * w;
    const y = cy + Math.sin(i * 1.4 + seedBase) * h * 0.5;
    ctx.lineTo(x, y + h * 0.4);
  }
  ctx.closePath();
  fillWithLight(ctx, cx, cy, w, h * 1.2, base, accent);
  drawSpecular(ctx, cx, cy - h * 0.1, w * 0.3, h * 0.3, 0.25);
  ctx.restore();
}

function drawOnion(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, base: string, accent: string, seedBase: number) {
  const pts = noisyRingPoints(cx, cy, w * 0.49, h, seedBase, 16, 0.05);
  pathSmoothClosed(ctx, pts);
  fillWithLight(ctx, cx, cy, w, h, base, accent);
  ctx.save();
  ctx.globalAlpha = 0.32;
  ctx.strokeStyle = accent;
  ctx.lineWidth = Math.max(1, h * 0.14);
  for (let i = -2; i <= 2; i++) {
    const ringPts = noisyRingPoints(cx + i * w * 0.13, cy, w * 0.08, h * 0.4, seedBase + i, 10, 0.15);
    pathSmoothClosed(ctx, ringPts);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLayerShape(
  ctx: CanvasRenderingContext2D,
  id: string,
  cx: number,
  cy: number,
  w: number,
  h: number,
  base: string,
  accent: string,
  seedBase: number,
) {
  if (id === "bun-top") drawBun(ctx, cx, cy, w, h, base, accent, true, seedBase);
  else if (id === "bun-bottom") drawBun(ctx, cx, cy, w, h, base, accent, false, seedBase);
  else if (id === "patty") drawPatty(ctx, cx, cy, w, h, base, accent, seedBase);
  else if (id === "cheese") drawCheese(ctx, cx, cy, w, h, base, accent, seedBase);
  else if (id === "lettuce") drawLettuce(ctx, cx, cy, w, h, base, accent, seedBase);
  else if (id.startsWith("sauce")) drawSauce(ctx, cx, cy, w, h, base, accent, seedBase);
  else if (id === "onion") drawOnion(ctx, cx, cy, w, h, base, accent, seedBase);
}

// ---------------------------------------------------------------------------
// Studio lighting, steam, pedestal, grain — the photographic dressing that
// sells "dark cinematic single-spotlight product shot" rather than "icon".
// ---------------------------------------------------------------------------

let grainPattern: CanvasPattern | null = null;
let grainCanvasKey = "";

function getGrainPattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  const key = "128";
  if (grainPattern && grainCanvasKey === key) return grainPattern;
  const size = 128;
  const tile = document.createElement("canvas");
  tile.width = size;
  tile.height = size;
  const tctx = tile.getContext("2d");
  if (!tctx) return null;
  const imgData = tctx.createImageData(size, size);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const v = 255 * (0.5 + (seeded(i * 0.618) + seeded(i * 1.37 + 5)) * 0.25);
    imgData.data[i] = v;
    imgData.data[i + 1] = v;
    imgData.data[i + 2] = v;
    imgData.data[i + 3] = 255;
  }
  tctx.putImageData(imgData, 0, 0);
  grainPattern = ctx.createPattern(tile, "repeat");
  grainCanvasKey = key;
  return grainPattern;
}

function drawGrain(ctx: CanvasRenderingContext2D, width: number, height: number, alpha: number) {
  const pattern = getGrainPattern(ctx);
  if (!pattern) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawSpotlight(ctx: CanvasRenderingContext2D, cx: number, cy: number, width: number, height: number, strength: number) {
  ctx.save();
  const cone = ctx.createRadialGradient(cx, cy - height * 0.12, 0, cx, cy - height * 0.12, Math.max(width, height) * 0.55);
  cone.addColorStop(0, `rgba(255, 236, 205, ${0.16 * strength})`);
  cone.addColorStop(0.45, `rgba(255, 200, 140, ${0.07 * strength})`);
  cone.addColorStop(1, "rgba(255, 200, 140, 0)");
  ctx.fillStyle = cone;
  ctx.fillRect(0, 0, width, height);

  const vignette = ctx.createRadialGradient(cx, cy, Math.min(width, height) * 0.25, cx, cy, Math.max(width, height) * 0.75);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawPedestal(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, alpha: number) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  const rw = w * 0.62;
  const rh = rw * 0.16;
  const grad = ctx.createLinearGradient(cx - rw / 2, cy, cx + rw / 2, cy);
  grad.addColorStop(0, "rgba(120, 90, 40, 0.4)");
  grad.addColorStop(0.5, "rgba(240, 200, 120, 0.85)");
  grad.addColorStop(1, "rgba(120, 90, 40, 0.4)");
  ctx.strokeStyle = grad;
  ctx.lineWidth = Math.max(2, rh * 0.22);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rw / 2, rh / 2, 0, 0, Math.PI * 2);
  ctx.stroke();

  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, rw * 0.7);
  glow.addColorStop(0, `rgba(255, 200, 120, ${0.18})`);
  glow.addColorStop(1, "rgba(255, 200, 120, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(cx - rw, cy - rw * 0.4, rw * 2, rw * 0.8);
  ctx.restore();
}

function drawSteamWisp(ctx: CanvasRenderingContext2D, x: number, baseY: number, height: number, width: number, time: number, seed: number, alpha: number) {
  if (alpha <= 0.01) return;
  ctx.save();
  const sway = Math.sin(time * 0.7 + seed) * width * 0.4;
  const rise = ((time * 14 + seed * 30) % (height * 1.2)) / (height * 1.2);
  const y = baseY - rise * height;
  const localAlpha = alpha * Math.sin(rise * Math.PI);
  const grad = ctx.createLinearGradient(x, y, x, y - height * 0.35);
  grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
  grad.addColorStop(0.5, `rgba(255, 255, 255, ${0.22 * localAlpha})`);
  grad.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(x + sway, y, width * 0.5, height * 0.35, 0, 0, Math.PI * 2);
  ctx.filter = "blur(6px)";
  ctx.fill();
  ctx.restore();
}

export type LayerFrame = {
  id: string;
  label: string;
  sublabel: string;
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  labelOpacity: number;
};

function drawLayerLabels(
  ctx: CanvasRenderingContext2D,
  frames: LayerFrame[],
  cx: number,
  cy: number,
  cameraZoom: number,
  burgerWidth: number,
) {
  ctx.save();
  ctx.textBaseline = "middle";
  const leaderLen = clamp(burgerWidth * 0.42, 60, 160);

  for (const f of frames) {
    if (f.labelOpacity <= 0.02) continue;
    const screenX = cx + (f.x - cx) * cameraZoom;
    const screenY = cy + (f.y - cy) * cameraZoom;
    const side = f.index % 2 === 0 ? 1 : -1;
    const anchorX = screenX + side * (f.w / 2 + 10);
    const labelX = screenX + side * (f.w / 2 + leaderLen);

    ctx.globalAlpha = f.labelOpacity;

    ctx.strokeStyle = "rgba(240, 192, 120, 0.55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(anchorX, screenY);
    ctx.lineTo(labelX - side * 6, screenY);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(anchorX, screenY, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(240, 192, 120, 0.85)";
    ctx.fill();

    ctx.textAlign = side > 0 ? "left" : "right";
    ctx.font = "600 15px 'Helvetica Neue', Arial, sans-serif";
    ctx.fillStyle = "rgba(245, 239, 230, 0.95)";
    ctx.fillText(f.label, labelX, screenY - 8);

    ctx.font = "400 11px 'Helvetica Neue', Arial, sans-serif";
    ctx.fillStyle = "rgba(201, 191, 174, 0.8)";
    ctx.fillText(f.sublabel, labelX, screenY + 10);
  }
  ctx.restore();
}

/**
 * Computes and draws the burger stack for a given explosion progress.
 * Returns per-layer screen-space frames so the caller can render matching
 * DOM label callouts in sync with the canvas.
 */
export function renderBurger(ctx: CanvasRenderingContext2D, opts: BurgerRenderOptions): LayerFrame[] {
  const { width, height, progress, time, reducedMotion } = opts;
  const idleStrength = opts.idleStrength ?? 1;
  ctx.clearRect(0, 0, width, height);

  const minDim = Math.min(width, height);
  const burgerWidth = clamp(minDim * 0.6, 190, 420);
  const layerH = burgerWidth * 0.19;
  const cx = width / 2;
  const cy = height * 0.54;

  const idleBob = reducedMotion ? 0 : Math.sin(time * 0.9) * 6 * idleStrength;
  const cameraZoom = 1 + smoothstep(0, 0.3, progress) * 0.12;
  const explosionAmt = reducedMotion ? 0 : smoothstep(0.32, 0.88, progress);
  const cameraTiltDeg = lerp(-1.6, 0, smoothstep(0, 0.25, progress));
  const pedestalAlpha = reducedMotion ? 0.55 : 0.6 * (1 - smoothstep(0.2, 0.5, progress));

  // dark studio backdrop with ember glow behind the stack
  const glowR = minDim * (0.42 + explosionAmt * 0.28);
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
  glow.addColorStop(0, `rgba(232, 115, 15, ${0.2 + explosionAmt * 0.2})`);
  glow.addColorStop(1, "rgba(232, 115, 15, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  drawPedestal(ctx, cx, cy + layerH * 2.1, burgerWidth, pedestalAlpha);

  // ambient steam rising behind the stack, strongest at rest
  const steamAlpha = reducedMotion ? 0 : (1 - explosionAmt) * 0.8 * idleStrength;
  if (steamAlpha > 0.01) {
    drawSteamWisp(ctx, cx - burgerWidth * 0.18, cy, minDim * 0.55, burgerWidth * 0.4, time, 1.3, steamAlpha);
    drawSteamWisp(ctx, cx + burgerWidth * 0.12, cy, minDim * 0.5, burgerWidth * 0.35, time, 4.1, steamAlpha * 0.8);
  }

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((cameraTiltDeg * Math.PI) / 180);
  ctx.scale(cameraZoom, cameraZoom);
  ctx.translate(-cx, -cy);

  const n = burgerLayers.length;
  const midIndex = (n - 1) / 2;
  const frames: LayerFrame[] = [];

  const order = burgerLayers.map((l, i) => ({ l, i })).sort((a, b) => {
    // draw back-to-front so separated layers overlap plausibly
    const da = Math.abs(a.i - midIndex);
    const db = Math.abs(b.i - midIndex);
    return db - da;
  });

  for (const { l, i } of order) {
    const dirFromCenter = i - midIndex; // negative = below center, positive = above
    const restY = cy - dirFromCenter * layerH * 0.92;
    const spread = smoothstep(0, 1, Math.abs(dirFromCenter) / midIndex) || 0.4;
    const maxTravel = minDim * (0.16 + spread * 0.2);
    const explodeY = restY - Math.sign(dirFromCenter || 1) * maxTravel * explosionAmt;
    const drift = Math.sin(i * 2.1 + 1) * minDim * 0.05 * explosionAmt;
    const rotation = Math.sin(i * 1.7 + 1) * 12 * explosionAmt;
    const bob = idleBob * (1 - explosionAmt) * (i % 2 === 0 ? 1 : -0.7);
    const scale = 1 + explosionAmt * 0.06;

    const x = cx + drift;
    const y = explodeY + bob;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 26 * (1 + explosionAmt);
    ctx.shadowOffsetY = 12;
    drawLayerShape(ctx, l.id, 0, 0, burgerWidth, layerH, l.color, l.accent, i * 7 + 3);
    ctx.restore();

    const labelOpacity = clamp(
      smoothstep(0.5 + i * 0.015, 0.68 + i * 0.015, progress) * smoothstep(1, 0.97, progress) ||
        smoothstep(0.5 + i * 0.015, 0.68 + i * 0.015, progress),
      0,
      1,
    );

    frames.push({
      id: l.id,
      label: l.label,
      sublabel: l.sublabel,
      index: i,
      x,
      y,
      w: burgerWidth * scale,
      h: layerH * scale,
      rotation,
      labelOpacity: reducedMotion ? 0 : labelOpacity,
    });
  }

  ctx.restore();

  // single dramatic overhead spotlight + vignette, like a studio product shot
  drawSpotlight(ctx, cx, cy, width, height, 1);

  if (!reducedMotion) {
    drawLayerLabels(ctx, frames, cx, cy, cameraZoom, burgerWidth);
  }

  // ember particles during peak explosion
  if (!reducedMotion && explosionAmt > 0.4) {
    ctx.save();
    const particleAlpha = smoothstep(0.4, 0.8, explosionAmt);
    for (let i = 0; i < 18; i++) {
      const seed = i * 17.13;
      const px = cx + Math.sin(seed + time * 0.4) * minDim * 0.45;
      const pyBase = cy + Math.cos(seed * 1.3) * minDim * 0.3;
      const py = pyBase - ((time * 30 + i * 40) % (minDim * 0.9));
      const size = 1.5 + (i % 3);
      ctx.globalAlpha = particleAlpha * (0.3 + 0.5 * Math.abs(Math.sin(seed + time)));
      ctx.fillStyle = i % 2 === 0 ? "#ffb35c" : "#ff7a30";
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawGrain(ctx, width, height, 0.05);

  return frames;
}
