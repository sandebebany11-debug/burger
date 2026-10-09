/**
 * Central image registry. Swap any `src` for a real Rialto photo later —
 * components only reference these keys.
 *
 * Current photos are cropped from Rialto's own printed menu. They sit on the
 * menu's cream paper tone, which is why food tiles use `--paper` as their
 * background (seamless edges). When replacing them with professional shots,
 * keep the same keys and update width/height.
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
  pizzaHero: img("pizza-gemuese-oliven", "Pizza mit Oliven, Zwiebeln, Tomaten und Paprika auf einem Holzbrett", 567, 516),
  pizzaGarnelen: { ...img("pizza-garnelen", "Pizza mit Garnelen", 585, 261), flushBottom: true },
  doenerTasche: img("doener-tasche", "Döner Tasche mit Dönerfleisch, Salat und Tzatziki", 300, 255),
  doenerTeller: img("doener-teller", "Döner Teller mit Pommes und Salat", 480, 200),
  doenerUeberbacken: img("doener-ueberbacken", "Döner überbacken in der Auflaufform", 350, 195),
  tuerkischePizza: img("tuerkische-pizza", "Türkische Pizza mit Salat und Tzatziki", 315, 255),
  falafel: img("falafel-duerum", "Falafel Dürüm mit Salat und roten Zwiebeln", 305, 170),
  schnitzel: img("schnitzel-wiener-art", "Schnitzel Wiener Art mit Zitrone, Pommes und Salat", 360, 208),
  burger: img("burger", "Burger im Brioche-Bun mit Salat, Tomate und Zwiebeln", 300, 260),
  nuggets: img("nuggets", "Chicken Nuggets mit Pommes, Sauce und Salat", 325, 170),
  spaghetti: img("spaghetti", "Teller Spaghetti", 320, 115),
  pizzabroetchen: img("pizzabroetchen", "Gefüllte Pizzabrötchen mit Spinat und Fetakäse", 390, 188),
} satisfies Record<string, SiteImage>;

export const brand = {
  badge: { src: "/images/brand/rialto-logo-badge.webp", alt: "Rialto Grill Pizzeria Logo", width: 640, height: 640 },
};
