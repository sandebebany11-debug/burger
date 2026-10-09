import { openingHours, type DayKey } from "../data/site";

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const formatTime = (hhmm: string) => hhmm.replace(":", ".");

/** Current time in Germany, independent of the visitor's time zone. */
function nowInBerlin(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return {
    day: weekdays.indexOf(get("weekday")) as DayKey,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

export interface OpenStatus {
  isOpen: boolean;
  today: DayKey;
  /** Human readable, e.g. "Geöffnet · bis 22.00 Uhr" */
  label: string;
}

export function getOpenStatus(date = new Date()): OpenStatus {
  const { day, minutes } = nowInBerlin(date);
  const slots = openingHours[day] ?? [];
  const current = slots.find((s) => minutes >= toMinutes(s.open) && minutes < toMinutes(s.close));
  if (current) {
    return { isOpen: true, today: day, label: `Jetzt geöffnet · bis ${formatTime(current.close)} Uhr` };
  }
  const later = slots.find((s) => minutes < toMinutes(s.open));
  if (later) {
    return { isOpen: false, today: day, label: `Geschlossen · öffnet heute um ${formatTime(later.open)} Uhr` };
  }
  for (let offset = 1; offset <= 7; offset++) {
    const next = ((day + offset) % 7) as DayKey;
    const first = openingHours[next]?.[0];
    if (first) {
      const when = offset === 1 ? "morgen" : new Intl.DateTimeFormat("de-DE", { weekday: "long" }).format(
        new Date(date.getTime() + offset * 86_400_000),
      );
      return { isOpen: false, today: day, label: `Geschlossen · öffnet ${when} um ${formatTime(first.open)} Uhr` };
    }
  }
  return { isOpen: false, today: day, label: "Derzeit geschlossen" };
}

export const formatSlots = (day: DayKey) => {
  const slots = openingHours[day];
  if (!slots || slots.length === 0) return "Ruhetag";
  return slots.map((s) => `${formatTime(s.open)} – ${formatTime(s.close)}`).join(", ");
};

/** Static summary used before the client knows "today" (prerender / first paint). */
export const hoursSummary = (() => {
  const days = [1, 2, 3, 4, 5, 6, 0] as DayKey[];
  const first = formatSlots(days[0]);
  return days.every((d) => formatSlots(d) === first) ? `Täglich ${first} Uhr` : "Öffnungszeiten";
})();
