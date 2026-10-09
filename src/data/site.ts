/**
 * Single source of truth for Rialto's business facts.
 *
 * Sources: the printed menu provided by the owner, the existing Impressum on
 * rialto-pizzeria.com and the Google Maps listing. Anything marked
 * `CONFIRM` below must be checked with the owner before launch
 * (see README → "Vor dem Launch bestätigen").
 */

export const site = {
  name: "Rialto Grill & Pizzeria",
  shortName: "Rialto",
  tagline: "Grill & Pizzeria in Witzhelden",
  url: "https://www.rialto-pizzeria.com/",

  phoneDisplay: "02174 8922500",
  phoneHref: "tel:+4921748922500",
  email: "info@rialto-pizzeria.com",

  address: {
    street: "Hauptstraße 19",
    postalCode: "42799",
    city: "Leichlingen",
    district: "Witzhelden",
    country: "DE",
  },
  mapsUrl: "https://maps.app.goo.gl/S4mG4rH412FzM9eMA",
  directionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=Rialto+Grill+Pizzeria,+Hauptstra%C3%9Fe+19,+42799+Leichlingen",
  mapEmbedUrl:
    "https://www.google.com/maps?q=Rialto+Grill+Pizzeria,+Hauptstra%C3%9Fe+19,+42799+Leichlingen&output=embed",

  /**
   * External online ordering. CONFIRM that this Lieferando listing is active
   * before launch — set to `null` to hide every "Online bestellen" button.
   */
  onlineOrder: {
    url: "https://www.lieferando.de/speisekarte/rialto-grill-pizzeria-leichlingen",
    label: "Lieferando",
  } as { url: string; label: string } | null,

  /** Links to real social profiles only. Empty = nothing rendered. */
  social: [] as { label: string; url: string }[],
};

export type DayKey = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday (Date#getDay)

export interface OpeningSlot {
  open: string; // "HH:MM"
  close: string;
}

/**
 * Opening hours as published in the existing Impressum ("Täglich 11.00–22.00 Uhr").
 * CONFIRM: some directories list Tuesday as Ruhetag.
 */
export const openingHours: Record<DayKey, OpeningSlot[]> = {
  1: [{ open: "11:00", close: "22:00" }],
  2: [{ open: "11:00", close: "22:00" }],
  3: [{ open: "11:00", close: "22:00" }],
  4: [{ open: "11:00", close: "22:00" }],
  5: [{ open: "11:00", close: "22:00" }],
  6: [{ open: "11:00", close: "22:00" }],
  0: [{ open: "11:00", close: "22:00" }],
};

export const dayNames: Record<DayKey, string> = {
  1: "Montag",
  2: "Dienstag",
  3: "Mittwoch",
  4: "Donnerstag",
  5: "Freitag",
  6: "Samstag",
  0: "Sonntag",
};

/** Monday-first display order. */
export const weekOrder: DayKey[] = [1, 2, 3, 4, 5, 6, 0];
