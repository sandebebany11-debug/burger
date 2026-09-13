/**
 * Verified real content for "Der dicke Bub".
 * Sourced from derdickebub.de and the owner-provided brief.
 * Do not invent prices, dishes, hours, or claims — extend this file only with facts
 * that can be verified against the restaurant's own materials.
 */

export const brand = {
  name: "Der dicke Bub",
  legalOwner: "Shahram Rahmani",
  claim: "Wir kreieren Burger mit Leidenschaft!",
  city: "Leverkusen-Schlebusch",
} as const;

export const contact = {
  ownerLine: "Inh. Shahram Rahmani",
  street: "Bergische Landstraße 38",
  postalCode: "51375",
  city: "Leverkusen",
  district: "Schlebusch",
  phone: "0214 31264848",
  phoneHref: "tel:+4921431264848",
  mobile: "0172 8732007",
  mobileHref: "tel:+491728732007",
  email: "info@derdickebub.de",
  emailHref: "mailto:info@derdickebub.de",
  shopUrl: "https://shop.derdickebub.de/",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Bergische+Landstra%C3%9Fe+38+51375+Leverkusen",
} as const;

export type DayHours = {
  label: string;
  hours: string[] | "closed";
};

export const openingHours: DayHours[] = [
  { label: "Montag", hours: "closed" },
  { label: "Dienstag – Donnerstag", hours: ["11:30 – 15:00 Uhr", "17:00 – 21:30 Uhr"] },
  { label: "Freitag & Samstag", hours: ["11:30 – 15:00 Uhr", "17:00 – 22:00 Uhr"] },
  { label: "Sonntag & Feiertag", hours: ["15:00 – 21:00 Uhr"] },
];

export const deliveryHours: DayHours[] = [
  { label: "Montag", hours: "closed" },
  { label: "Dienstag – Samstag", hours: ["12:00 – 15:00 Uhr", "17:00 – 21:00 Uhr"] },
  { label: "Sonntag & Feiertag", hours: ["17:00 – 21:00 Uhr"] },
];

export const lastOrder = "21:00 Uhr";

// The ten reasons as communicated by the restaurant (paraphrased qualities,
// consistent with the material published by Der dicke Bub). Kept short so
// each can carry a large numeral in the "10 besten Gründe" section.
export const tenReasons: string[] = [
  "Frisches Fleisch – täglich selbst gewolft",
  "Hausgemachte Burgersaucen, ganz ohne Fertigprodukte",
  "Belgische Kartoffeln, direkt vom Erzeuger",
  "Saisonales Gemüse aus der Region",
  "Falafel für die vegetarische Karte",
  "Vegane Optionen auf Wunsch",
  "Laktosefrei & glutenfrei möglich",
  "Eigene Rezepturen von Shahram Rahmani",
  "Seit 2015 mit Leidenschaft in Schlebusch",
  "Restaurant & Lieferservice aus einer Hand",
];

export const qualityPoints: { title: string; text: string }[] = [
  {
    title: "Frisches, selbst gewolftes Fleisch",
    text: "Für die Patties wird ausschließlich hochwertiges Rindfleisch verwendet, ohne Zusätze – täglich frisch selbst gewolft.",
  },
  {
    title: "Hausgemachte Saucen",
    text: "Alle Burgersaucen entstehen in der eigenen Küche – von der Bub-Sauce bis zur Mango-Chili-Sauce.",
  },
  {
    title: "Belgische Kartoffeln",
    text: "Für die Fritten holt Shahram Rahmani seine Kartoffeln wöchentlich direkt bei einem Erzeuger in Belgien.",
  },
  {
    title: "Saisonales Gemüse",
    text: "Salate und Beilagen setzen auf saisonales, frisches Gemüse.",
  },
  {
    title: "Falafel & pflanzliche Optionen",
    text: "Mit Falafel-Burgern und pflanzlichen Alternativen ist auch die vegetarische und vegane Karte hochwertig besetzt.",
  },
  {
    title: "Laktosefrei & glutenfrei möglich",
    text: "Auf Wunsch werden Unverträglichkeiten berücksichtigt – laktosefreie und glutenfreie Zubereitung ist möglich.",
  },
];

export const nameOrigin = {
  heading: "Warum „Der dicke Bub“?",
  text: "Der Name steht für Vollkommenheit, Vollständigkeit und die Fülle der Speisen – ein Versprechen an jeden Gast, der das Restaurant betritt.",
};

export const story = {
  headline: "Eine Leidenschaft. Ein Ort. Ein dicker Bub.",
  paragraphs: [
    "Shahram Rahmani arbeitet seit 1998 in der Gastronomie.",
    "Im Frühjahr 2015 erfüllte er sich in Leverkusen-Schlebusch den Wunsch nach einem eigenen Restaurant und Lieferservice: Der dicke Bub.",
    "Seither steht er mit Leidenschaft für frische Zutaten, selbstgemachte Saucen und Burger, die von Hand entstehen – Tag für Tag.",
  ],
};

// Burger categories reflect the real menu structure of Der dicke Bub.
// Exact dish names/prices change and are intentionally not hard-coded here —
// they belong in the live shop. Ingredients listed are verifiably real.
export type BurgerCategory = {
  id: string;
  name: string;
  description: string;
  tags: string[];
};

export const burgerCategories: BurgerCategory[] = [
  {
    id: "beef",
    name: "Beef Burger",
    description:
      "Selbst gewolftes Rindfleisch, klassisch als Cheeseburger oder in eigenen Kreationen – mit hausgemachter Bub-Sauce.",
    tags: ["Beef", "Cheddar", "Bub-Sauce"],
  },
  {
    id: "chicken",
    name: "Chicken Burger",
    description:
      "Gegrilltes Hähnchenfilet, saftig und mit frischem Gemüse kombiniert.",
    tags: ["Chicken", "Gegrillt", "Frisches Gemüse"],
  },
  {
    id: "fisch",
    name: "Lachs Burger",
    description: "Fisch-Burger mit saisonalem Gemüse für alle, die es leichter mögen.",
    tags: ["Lachs", "Saisonal"],
  },
  {
    id: "falafel",
    name: "Falafel Burger",
    description:
      "Die vegetarische Variante mit Falafel, wahlweise mit Feta, Ziegenkäse oder Büffelmozzarella.",
    tags: ["Vegetarisch", "Falafel"],
  },
];

export const sauces: string[] = [
  "Bub-Sauce",
  "Mango-Chili-Sauce",
  "Pesto",
  "Erdnusssauce",
  "Hummussauce",
];

// Burger stack layers, bottom to top, used to render the ScrollStage
// explosion. Only actual burger components — no sides or drinks here.
export type BurgerLayer = {
  id: string;
  label: string;
  sublabel: string;
  color: string;
  accent: string;
};

export const burgerLayers: BurgerLayer[] = [
  { id: "bun-bottom", label: "Sesambrötchen", sublabel: "Boden", color: "#c78a43", accent: "#e6ab68" },
  { id: "sauce-1", label: "Bub-Sauce", sublabel: "Hausgemacht", color: "#a8501c", accent: "#d97a3c" },
  { id: "patty", label: "Beef Patty", sublabel: "Selbst gewolft", color: "#5a3a2a", accent: "#8a5a3a" },
  { id: "cheese", label: "Cheddar", sublabel: "Geschmolzen", color: "#e8a638", accent: "#ffce6b" },
  { id: "onion", label: "Röstzwiebeln", sublabel: "Karamellisiert", color: "#9a6a34", accent: "#c98f4e" },
  { id: "lettuce", label: "Frisches Gemüse", sublabel: "Saisonal", color: "#5c8a4a", accent: "#8fc46b" },
  { id: "sauce-2", label: "Bub-Sauce", sublabel: "Hausgemacht", color: "#b5651d", accent: "#e08a3c" },
  { id: "bun-top", label: "Sesambrötchen", sublabel: "Oberer Deckel", color: "#d99a4e", accent: "#f0c078" },
];

// Broader ingredient set for the horizontal "CUT" scroll — sides, proteins
// and pantry items that are genuinely part of the Der dicke Bub kitchen.
export type Ingredient = {
  id: string;
  label: string;
  sublabel: string;
  color: string;
  accent: string;
};

export const ingredients: Ingredient[] = [
  { id: "beef", label: "Beef", sublabel: "Selbst gewolft", color: "#5a3a2a", accent: "#8a5a3a" },
  { id: "chicken", label: "Chicken", sublabel: "Gegrillt", color: "#d9b06a", accent: "#f0cf8f" },
  { id: "lachs", label: "Lachs", sublabel: "Saisonal serviert", color: "#c9704f", accent: "#e89a78" },
  { id: "falafel", label: "Falafel", sublabel: "Vegetarisch", color: "#6f8a3c", accent: "#9cbf63" },
  { id: "kartoffeln", label: "Belgische Kartoffeln", sublabel: "Direkt vom Erzeuger", color: "#c9a227", accent: "#e6c34a" },
  { id: "gemuese", label: "Frisches Gemüse", sublabel: "Saisonal", color: "#5c8a4a", accent: "#8fc46b" },
  { id: "saucen", label: "Hausgemachte Saucen", sublabel: "Bub-Sauce & mehr", color: "#a8501c", accent: "#d97a3c" },
  { id: "broetchen", label: "Sesambrötchen", sublabel: "Frisch gebacken", color: "#c78a43", accent: "#e6ab68" },
];

export const nav = [
  { label: "Burger", href: "#burger" },
  { label: "Qualität", href: "#qualitaet" },
  { label: "Über uns", href: "#ueber-uns" },
  { label: "Kontakt", href: "#kontakt" },
];

export const seo = {
  title: "Der dicke Bub – Burger Restaurant & Lieferservice in Leverkusen",
  description:
    "Der dicke Bub in Leverkusen-Schlebusch: Burger mit Leidenschaft. Frisches, selbst gewolftes Fleisch, hausgemachte Saucen und belgische Kartoffeln. Restaurant & Lieferservice – jetzt online bestellen.",
};
