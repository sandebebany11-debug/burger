import { berlinNow, toMinutes } from "../../shared/reservations";
import { hours } from "../data/content";

const DAY = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

export type OpenStatus = { state: "open" | "closed" | "unknown"; text: string };

function rowFor(weekday: number) {
  return hours.find((h) => h.weekdays.includes(weekday));
}

function span(time: string): [number, number] {
  const [from, to] = time.split("–").map((s) => toMinutes(s.trim()));
  return [from, to];
}

/** Live opening status in the restaurant's time zone (Europe/Berlin). */
export function openStatus(date = new Date()): OpenStatus {
  const now = berlinNow(date);
  const wd = new Date(`${now.date}T12:00:00Z`).getUTCDay();
  const today = rowFor(wd);

  if (!today?.time) return { state: "unknown", text: `${DAY[wd]}: Öffnungszeiten bitte telefonisch erfragen` };

  const [from, to] = span(today.time);
  const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  if (now.minutes >= from && now.minutes < to) return { state: "open", text: `Jetzt geöffnet · schließt um ${fmt(to)} Uhr` };
  if (now.minutes < from) return { state: "closed", text: `Geschlossen · öffnet heute um ${fmt(from)} Uhr` };

  const nextWd = (wd + 1) % 7;
  const next = rowFor(nextWd);
  if (!next?.time) return { state: "closed", text: `Geschlossen · ${DAY[nextWd]}: bitte telefonisch erfragen` };
  return { state: "closed", text: `Geschlossen · öffnet morgen um ${fmt(span(next.time)[0])} Uhr` };
}
