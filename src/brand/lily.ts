// Fleur-de-lis outlines (viewBox 0 0 200 250), drawn after the gold emblem
// on the house sign. The right half is defined; the left is mirrored.
export const LILY_VIEWBOX = "0 0 200 250";
export const LILY_MIRROR = "translate(200 0) scale(-1 1)";

export const LILY_PATHS = {
  center: "M100 6 C110 30 126 58 126 90 C126 116 115 134 105 150 L100 150 Z",
  petal:
    "M108 148 C114 116 134 94 162 92 C186 90 202 108 198 130 C195 147 180 156 168 150 C182 142 184 124 170 118 C152 111 132 126 120 150 Z",
  foot: "M110 172 C124 174 138 186 138 202 C138 214 128 220 120 214 C128 208 128 196 118 188 C113 184 110 180 110 172 Z",
  stem: "M100 172 C107 190 110 208 100 244 L100 172 Z",
};

export const LILY_BAND = { x: 66, y: 150, width: 68, height: 22, rx: 11 };

/** Standalone SVG markup (for favicons, masks, social images). */
export function lilySvg(fill: string, extra = ""): string {
  const halves = Object.values(LILY_PATHS)
    .map((d) => `<path d="${d}"/><path d="${d}" transform="${LILY_MIRROR}"/>`)
    .join("");
  const b = LILY_BAND;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${LILY_VIEWBOX}"${extra}><g fill="${fill}">${halves}<rect x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" rx="${b.rx}"/></g></svg>`;
}
