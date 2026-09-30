// Favicon, touch icons and manifest from the logo (public/brand/lilie.png,
// produced by scripts/logo.mjs).   npm run brand
import { copyFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const INK = "#14110e";
const LOGO = "public/brand/lilie.png";

// mask for the gold glint (bundled with the CSS)
await copyFile("public/brand/lilie-small.png", "src/brand/lilie-mask.png");

/** logo centred on an ink tile */
async function tile(size, logoHeight, radius = 0) {
  const logo = await sharp(LOGO).resize({ height: logoHeight }).toBuffer();
  const { width } = await sharp(logo).metadata();
  const bg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${INK}"/></svg>`,
  );
  return sharp(bg)
    .composite([{ input: logo, left: Math.round((size - width) / 2), top: Math.round((size - logoHeight) / 2) }])
    .png();
}

await (await tile(64, 50, 14)).toFile("public/favicon-64.png");
await (await tile(32, 26, 7)).toFile("public/favicon-32.png");
await (await tile(180, 124)).toFile("public/apple-touch-icon.png");
await (await tile(192, 132)).toFile("public/icon-192.png");
await (await tile(512, 352)).toFile("public/icon-512.png");

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
console.log("brand assets written");
