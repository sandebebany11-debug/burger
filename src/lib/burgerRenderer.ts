import { burgerLayers } from "../data/content";

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Deterministic pseudo-random in [-1, 1] from an integer seed. */
const seeded = (n: number) => Math.sin(n * 12.9898) * 43758.5453 % 1;

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

function drawRoundedBlob(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  radius: number,
) {
  const rx = w / 2;
  const ry = h / 2;
  const r = Math.min(radius, ry);
  ctx.beginPath();
  ctx.moveTo(cx - rx + r, cy - ry);
  ctx.lineTo(cx + rx - r, cy - ry);
  ctx.quadraticCurveTo(cx + rx, cy - ry, cx + rx, cy - ry + r);
  ctx.lineTo(cx + rx, cy + ry - r);
  ctx.quadraticCurveTo(cx + rx, cy + ry, cx + rx - r, cy + ry);
  ctx.lineTo(cx - rx + r, cy + ry);
  ctx.quadraticCurveTo(cx - rx, cy + ry, cx - rx, cy + ry - r);
  ctx.lineTo(cx - rx, cy - ry + r);
  ctx.quadraticCurveTo(cx - rx, cy - ry, cx - rx + r, cy - ry);
  ctx.closePath();
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
  const grad = ctx.createLinearGradient(cx - w / 2, cy - h / 2, cx + w * 0.15, cy + h / 2);
  grad.addColorStop(0, accent);
  grad.addColorStop(0.55, base);
  grad.addColorStop(1, shadeColor(base, -0.22));
  ctx.fillStyle = grad;
  ctx.fill();
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
    ctx.beginPath();
    ctx.ellipse(cx, cy + h * 0.15, w / 2, h * 1.35, 0, Math.PI, 0, false);
    ctx.lineTo(cx + w / 2, cy + h / 2);
    drawRoundedBlob(ctx, cx, cy + h * 0.42, w, h * 0.5, h * 0.4);
    fillWithLight(ctx, cx, cy - h * 0.1, w, h * 2, base, accent);
    ctx.beginPath();
    ctx.ellipse(cx, cy - h * 0.1, w / 2, h * 1.1, 0, Math.PI, 0, false);
    fillWithLight(ctx, cx, cy - h * 0.3, w, h * 1.6, base, accent);

    ctx.fillStyle = "rgba(255, 244, 220, 0.85)";
    for (let i = 0; i < 14; i++) {
      const t = i / 13;
      const sx = cx + lerp(-w * 0.36, w * 0.36, t) + seeded(seedBase + i) * 6;
      const sy = cy - h * 0.55 + Math.abs(t - 0.5) * h * 0.9 + seeded(seedBase + i * 3) * 3;
      ctx.beginPath();
      ctx.ellipse(sx, sy, 3.2, 1.8, seeded(seedBase + i * 5), 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    drawRoundedBlob(ctx, cx, cy, w, h, h * 0.42);
    fillWithLight(ctx, cx, cy, w, h, base, accent);
  }
  ctx.restore();
}

function drawPatty(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, base: string, accent: string) {
  drawRoundedBlob(ctx, cx, cy, w, h, h * 0.32);
  fillWithLight(ctx, cx, cy, w, h, base, accent);
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = shadeColor(base, -0.35);
  ctx.lineWidth = Math.max(1.5, h * 0.09);
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.34, cy + i * h * 0.22);
    ctx.lineTo(cx + w * 0.34, cy + i * h * 0.22 - h * 0.1);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCheese(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, base: string, accent: string) {
  const dripCount = 6;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, cy - h / 2);
  ctx.lineTo(cx + w / 2, cy - h / 2);
  ctx.lineTo(cx + w / 2, cy);
  for (let i = dripCount; i >= 0; i--) {
    const t = i / dripCount;
    const x = cx - w / 2 + t * w;
    const drip = (Math.sin(i * 2.4) * 0.5 + 0.5) * h * 0.9;
    ctx.lineTo(x, cy + h * 0.25 + drip);
  }
  ctx.closePath();
  fillWithLight(ctx, cx, cy, w * 1.02, h * 1.6, base, accent);
}

function drawLettuce(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, base: string, accent: string) {
  const bumps = 10;
  ctx.beginPath();
  for (let i = 0; i <= bumps; i++) {
    const t = i / bumps;
    const x = cx - w / 2 + t * w;
    const y = cy - h / 2 - Math.abs(Math.sin(i * 1.9)) * h * 0.55;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.lineTo(cx + w / 2, cy + h / 2);
  ctx.lineTo(cx - w / 2, cy + h / 2);
  ctx.closePath();
  fillWithLight(ctx, cx, cy, w, h * 1.4, base, accent);
}

function drawSauce(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, base: string, accent: string) {
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  const waves = 8;
  for (let i = 0; i <= waves; i++) {
    const t = i / waves;
    const x = cx - w / 2 + t * w;
    const y = cy + Math.sin(i * 1.4) * h * 0.5;
    if (i === 0) ctx.moveTo(x, y - h * 0.4);
    else ctx.lineTo(x, y - h * 0.4);
  }
  for (let i = waves; i >= 0; i--) {
    const t = i / waves;
    const x = cx - w / 2 + t * w;
    const y = cy + Math.sin(i * 1.4) * h * 0.5;
    ctx.lineTo(x, y + h * 0.4);
  }
  ctx.closePath();
  fillWithLight(ctx, cx, cy, w, h * 1.2, base, accent);
  ctx.restore();
}

function drawOnion(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, base: string, accent: string) {
  drawRoundedBlob(ctx, cx, cy, w * 0.98, h, h * 0.4);
  fillWithLight(ctx, cx, cy, w, h, base, accent);
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = accent;
  ctx.lineWidth = Math.max(1, h * 0.15);
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.ellipse(cx + i * w * 0.14, cy, w * 0.08, h * 0.4, 0, 0, Math.PI * 2);
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
  else if (id === "patty") drawPatty(ctx, cx, cy, w, h, base, accent);
  else if (id === "cheese") drawCheese(ctx, cx, cy, w, h, base, accent);
  else if (id === "lettuce") drawLettuce(ctx, cx, cy, w, h, base, accent);
  else if (id.startsWith("sauce")) drawSauce(ctx, cx, cy, w, h, base, accent);
  else if (id === "onion") drawOnion(ctx, cx, cy, w, h, base, accent);
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
  const burgerWidth = clamp(minDim * 0.62, 190, 430);
  const layerH = burgerWidth * 0.19;
  const cx = width / 2;
  const cy = height * 0.54;

  const idleBob = reducedMotion ? 0 : Math.sin(time * 0.9) * 6 * idleStrength;
  const cameraZoom = 1 + smoothstep(0, 0.3, progress) * 0.12;
  const explosionAmt = reducedMotion ? 0 : smoothstep(0.32, 0.88, progress);
  const cameraTiltDeg = lerp(-1.6, 0, smoothstep(0, 0.25, progress));

  // ember glow behind the stack, intensifying with explosion
  const glowR = minDim * (0.42 + explosionAmt * 0.28);
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
  glow.addColorStop(0, `rgba(232, 115, 15, ${0.22 + explosionAmt * 0.22})`);
  glow.addColorStop(1, "rgba(232, 115, 15, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

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
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = 24 * (1 + explosionAmt);
    ctx.shadowOffsetY = 10;
    drawLayerShape(ctx, l.id, 0, 0, burgerWidth, layerH, l.color, l.accent, i * 7);
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

  return frames;
}
