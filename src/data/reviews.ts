/**
 * Guest reviews.
 *
 * ONLY add real reviews here — copied word for word from Google (or another
 * platform) with the reviewer's displayed name, star rating, date and source.
 * Shorten with "…" if needed, never rephrase. Invented or "improved" reviews
 * are misleading under German competition law (UWG) and Google's policies.
 *
 * While `reviews` is empty, the section shows a prominent invitation to read
 * and write reviews on Google instead of review cards.
 */

export interface Review {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  /** Display date, e.g. "März 2026". */
  date: string;
  source: "Google" | "Lieferando" | "Tripadvisor";
  url?: string;
}

export const reviews: Review[] = [];

/**
 * Aggregate rating from the Google Business Profile. Fill in from the live
 * profile (e.g. { value: 4.2, count: 159 }) — it is shown in the UI only when
 * set, and it is never written into structured data.
 */
export const googleRating: { value: number; count: number } | null = null;

/** Link that opens the Google reviews. A direct "write review" link needs the place ID. */
export const reviewLinks = {
  read: "https://maps.app.goo.gl/S4mG4rH412FzM9eMA",
  /** Replace with https://search.google.com/local/writereview?placeid=<PLACE_ID> once known. */
  write: "https://maps.app.goo.gl/S4mG4rH412FzM9eMA",
};
