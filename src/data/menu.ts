// Menu excerpt compiled from public listings of Casa Ducale (quandoo,
// ubereats, speisekarte.de, coolibri — see content.ts SOURCES).
//
// ⚠︎ BESTÄTIGEN: These are third-party listings; prices may be outdated and
// the full menu is longer. Replace this file with the current house menu
// before launch. Never add dishes or prices that are not on the real menu.
// A dish without a confirmed price keeps `price: null` (shown as "—").

export type Dish = { name: string; description?: string; price: string | null; house?: boolean };
export type MenuCategory = { id: string; label: string; italian: string; intro?: string; dishes: Dish[] };

export const MENU_NOTE =
  "Auszug aus unserer Karte. Die vollständige und aktuelle Speisekarte mit allen Preisen erhalten Sie im Restaurant.";

export const menu: MenuCategory[] = [
  {
    id: "colazione",
    label: "Frühstück",
    italian: "Colazione",
    intro: "Ab 08:30 Uhr.",
    dishes: [
      { name: "Croissant", description: "mit Marmelade & Nutella", price: "3,30" },
      { name: "Rührei", price: "5,20" },
      { name: "Strammer Max", price: "5,40" },
    ],
  },
  {
    id: "antipasti",
    label: "Vorspeisen",
    italian: "Antipasti",
    dishes: [
      { name: "Antipasti Ducale", description: "Gemischte Vorspeise nach Art des Hauses", price: "10,90", house: true },
      { name: "Mozzarella e Pomodoro", description: "Mozzarella auf Tomaten", price: null },
      { name: "Carpaccio", price: null },
      { name: "Bruschetta", price: null },
    ],
  },
  {
    id: "insalate",
    label: "Salate",
    italian: "Insalate",
    dishes: [
      { name: "Insalata Mista", description: "Gemischter Salat", price: "ab 3,50" },
      { name: "Insalata Capricciosa", description: "Gemischter Salat mit Thunfisch, Ei, Sardellen und Oliven", price: "6,30 – 8,10" },
      { name: "Insalata Italiana", description: "mit Thunfisch und Mozzarella", price: "7,10 – 9,10" },
      { name: "Insalata Pescatore", description: "Gemischter Salat mit Lachs, Krabben und Gambas", price: null },
      { name: "Caesar Salad", price: null },
    ],
  },
  {
    id: "pasta",
    label: "Pasta",
    italian: "Pasta",
    intro: "Nach original italienischen Rezepten.",
    dishes: [
      { name: "Penne alla Vegetaria", price: "8,50" },
      { name: "Tortellini alla Panna", price: "8,90" },
      { name: "Penne Arrabbiata", description: "Kapern, Paprika, Oliven — scharf, in Tomatensauce", price: null },
      { name: "Penne al Salmone", description: "mit Lachs, frischen Tomaten und Tomatensahnesauce", price: null },
      { name: "Penne allo Chef al Forno", description: "mit Schinken, Erbsen, Champignons in Tomatensahnesauce, mit Käse überbacken", price: null },
    ],
  },
  {
    id: "pizza",
    label: "Pizza",
    italian: "Pizze",
    intro: "Nach original italienischem Rezept.",
    dishes: [
      { name: "Pizza Ducale", description: "Tomatensauce, Käse, Salami, Schinken, Artischocken, Ei, Champignons & Oregano", price: "9,80", house: true },
    ],
  },
  {
    id: "carne",
    label: "Fleisch",
    italian: "Carne",
    dishes: [
      { name: "Scaloppa ai Funghi", description: "Putenmedaillons in Champignonsauce", price: "16,20" },
      { name: "Scaloppa al Pepe", description: "Putenmedaillons in Pfeffersauce", price: "16,20" },
      { name: "Bistecca", description: "Steak mit verschiedenen Saucen", price: null },
    ],
  },
  {
    id: "pesce",
    label: "Fisch",
    italian: "Pesce",
    dishes: [
      { name: "Lachsfilet", description: "Saftiges Lachsfilet auf Tomatenbett", price: "14,90" },
      { name: "Gambas", description: "Gebratene Gambas mit Paprika-Chili-Salsa", price: null },
    ],
  },
];
