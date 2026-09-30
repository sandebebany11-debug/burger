// Renders public/og-image.jpg (1200×630) in headless Chromium so the real
// brand typeface is used.   npm run og   (requires Playwright + Chromium)
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const font = await readFile(
  path.resolve("node_modules/@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-italic.woff2"),
);
const sans = await readFile(path.resolve("node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2"));
const logo = await sharp("public/brand/lilie.png").resize({ height: 180 }).png().toBuffer();
const photo = await sharp("assets-src/photos/pizze-candela.jpg").resize(760, 630, { fit: "cover", position: "centre" }).jpeg({ quality: 88 }).toBuffer();

const html = `<!doctype html><html><head><style>
@font-face{font-family:C;src:url(data:font/woff2;base64,${font.toString("base64")}) format("woff2");font-style:italic;font-weight:300 700}
@font-face{font-family:M;src:url(data:font/woff2;base64,${sans.toString("base64")}) format("woff2");font-weight:200 800}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#14110e;color:#f3ede3;display:grid;grid-template-columns:520px 680px;overflow:hidden}
.l{display:grid;align-content:center;justify-items:start;padding:0 64px;gap:22px}
.l img{height:90px;width:auto}
h1{font:italic 400 104px/0.9 C;letter-spacing:-.02em}
p{font:600 15px M;letter-spacing:.5em;text-transform:uppercase;color:#b8914f}
small{font:500 17px M;color:rgba(243,237,227,.66)}
.r{background:url(data:image/jpeg;base64,${photo.toString("base64")}) center/cover;clip-path:inset(56px 56px 0 0 round 320px 320px 0 0)}
</style></head><body><div class="l"><img src="data:image/png;base64,${logo.toString("base64")}"><h1>Casa<br>Ducale</h1><p>Cucina Italiana</p><small>Leverkusen-Wiesdorf · Wiesdorfer Platz</small></div><div class="r"></div></body></html>`;

// Playwright is not a project dependency; point PLAYWRIGHT_MODULE at an install if needed.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot();
await browser.close();
await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile("public/og-image.jpg");
console.log("public/og-image.jpg");
