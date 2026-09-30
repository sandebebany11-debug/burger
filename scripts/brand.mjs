// Generates favicon, touch icon, the sheen mask and the Open Graph image from
// the lily geometry in src/brand/lily.ts.   npm run brand
import { writeFile } from "node:fs/promises";
import sharp from "sharp";
import { lilySvg } from "../src/brand/lily.ts";

const GOLD = "#b8914f";
const INK = "#14110e";


// mask for the gold sheen (solid shape)
await writeFile("src/brand/lily-mask.svg", lilySvg("#000"));

// favicon: gold lily on an ink tile, readable at 16px
const lilyInner = lilySvg(GOLD).replace(/^<svg[^>]*>|<\/svg>$/g, "");
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${INK}"/><svg x="12" y="7" width="40" height="50" viewBox="0 0 200 250">${lilyInner}</svg></svg>`;
await writeFile("public/favicon.svg", favicon);
await sharp(Buffer.from(favicon)).resize(32, 32).png().toFile("public/favicon-32.png");

const touch = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180"><rect width="180" height="180" fill="${INK}"/><svg x="45" y="28" width="90" height="113" viewBox="0 0 200 250">${lilyInner}</svg></svg>`;
await sharp(Buffer.from(touch)).png().toFile("public/apple-touch-icon.png");
for (const s of [192, 512]) {
  const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180"><rect width="180" height="180" fill="${INK}"/><svg x="50" y="34" width="80" height="100" viewBox="0 0 200 250">${lilyInner}</svg></svg>`;
  await sharp(Buffer.from(icon)).resize(s, s).png().toFile(`public/icon-${s}.png`);
}

await writeFile(
  "public/site.webmanifest",
  JSON.stringify(
    {
      name: "Casa Ducale – Cucina Italiana",
      short_name: "Casa Ducale",
      start_url: "/",
      display: "browser",
      background_color: INK,
      theme_color: INK,
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    null,
    2,
  ),
);

console.log("brand assets written (og-image is rendered by scripts/og-image.mjs)");
