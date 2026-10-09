/**
 * Central image registry. Swap any `src` for a real Rialto photo later —
 * components only reference these keys.
 *
 * Current photos are cropped from Rialto's printed menu, upscaled 4x (EDSR)
 * and cut out to transparent WebP so they float on the dark food tiles.
 * When replacing them with professional shots, keep the same keys and
 * update width/height.
 */

export interface SiteImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** The photo is cropped at its bottom edge and should sit flush on the tile edge. */
  flushBottom?: boolean;
}

const img = (file: string, alt: string, width: number, height: number): SiteImage => ({
  src: `/images/food/${file}.webp`,
  alt,
  width,
  height,
});

export const images = {
  pizzaHero: img("pizza-gemuese-oliven", "Pizza mit Oliven, Zwiebeln, Tomaten und Paprika auf einem Holzbrett", 1400, 1138),
  pizzaGarnelen: { ...img("pizza-garnelen", "Pizza mit Garnelen", 1400, 553), flushBottom: true },
  doenerTasche: img("doener-tasche", "Döner Tasche mit Dönerfleisch, Salat und Tzatziki", 1100, 912),
  doenerTeller: img("doener-teller", "Döner Teller mit Pommes und Salat", 1400, 503),
  doenerUeberbacken: img("doener-ueberbacken", "Döner überbacken in der Auflaufform", 1100, 637),
  tuerkischePizza: img("tuerkische-pizza", "Türkische Pizza mit Salat und Tzatziki", 1080, 913),
  falafel: img("falafel-duerum", "Falafel Dürüm mit Salat und roten Zwiebeln", 810, 598),
  schnitzel: img("schnitzel-wiener-art", "Schnitzel Wiener Art mit Zitrone, Pommes und Salat", 1091, 716),
  burger: img("burger", "Burger im Brioche-Bun mit Salat, Tomate und Zwiebeln", 1053, 901),
  nuggets: img("nuggets", "Chicken Nuggets mit Pommes, Sauce und Salat", 1100, 543),
  spaghetti: img("spaghetti", "Teller Spaghetti", 760, 381),
  pizzabroetchen: img("pizzabroetchen", "Gefüllte Pizzabrötchen mit Spinat und Fetakäse", 1400, 700),
} satisfies Record<string, SiteImage>;

export const brand = {
  badge: { src: "/images/brand/rialto-logo-badge.webp", alt: "Rialto Grill Pizzeria Logo", width: 640, height: 640 },
};
