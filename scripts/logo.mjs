// Cuts the gold fleur-de-lis (assets-src/logo-lilie.jpg, white background)
// into a transparent PNG/WebP. Only large white regions count as background,
// so the white highlights inside the gold stay opaque; the outline is
// anti-aliased by un-mixing edge pixels against white.   npm run logo
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const SRC = "assets-src/logo-lilie.jpg";
const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const N = W * H;
const px = (i) => [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];
const whiteish = new Uint8Array(N);
for (let i = 0; i < N; i++) whiteish[i] = Math.min(...px(i)) >= 228 ? 1 : 0;

// connected white regions; big ones are background
const bg = new Uint8Array(N);
const seen = new Uint8Array(N);
for (let s = 0; s < N; s++) {
  if (!whiteish[s] || seen[s]) continue;
  const stack = [s];
  const region = [];
  seen[s] = 1;
  while (stack.length) {
    const i = stack.pop();
    region.push(i);
    const x = i % W;
    const y = (i / W) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const n = ny * W + nx;
      if (whiteish[n] && !seen[n]) {
        seen[n] = 1;
        stack.push(n);
      }
    }
  }
  if (region.length > 600) for (const i of region) bg[i] = 1;
}

// distance (in px, up to 3) from background for edge softening
const near = (i) => {
  const x = i % W;
  const y = (i / W) | 0;
  for (let d = 1; d <= 2; d++)
    for (let dy = -d; dy <= d; dy++)
      for (let dx = -d; dx <= d; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < W && ny < H && bg[ny * W + nx]) return true;
      }
  return false;
};

const out = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  const [r, g, b] = px(i);
  let a = 1;
  if (bg[i]) a = 0;
  else if (near(i)) a = Math.min(1, Math.max(0, (255 - b) / (255 - 40)));
  const un = (c) => (a > 0 ? Math.round(Math.min(255, Math.max(0, (c - (1 - a) * 255) / a))) : 0);
  out.set([un(r), un(g), un(b), Math.round(a * 255)], i * 4);
}

await mkdir("public/brand", { recursive: true });
const buf = await sharp(out, { raw: { width: W, height: H, channels: 4 } }).trim({ threshold: 1 }).png().toBuffer();
await sharp(buf).resize({ height: 640 }).png({ compressionLevel: 9 }).toFile("public/brand/lilie.png");
await sharp(buf).resize({ height: 640 }).webp({ quality: 92, alphaQuality: 100 }).toFile("public/brand/lilie.webp");
await sharp(buf).resize({ height: 160 }).png({ compressionLevel: 9 }).toFile("public/brand/lilie-small.png");
const m = await sharp("public/brand/lilie.png").metadata();
console.log(`lilie.png ${m.width}x${m.height}`);
