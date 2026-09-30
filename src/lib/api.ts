import type { DayState, FieldErrors, ReservationInput, SlotState } from "../../shared/reservations";

export type Meta = { maxPartySize: number; bookingHorizonDays: number; today: string };
export type MonthResponse = Meta & { month: string; days: Record<string, DayState> };
export type DayResponse = Meta & { date: string; state: DayState; slots: { time: string; state: SlotState }[] };

export class ApiError extends Error {
  status: number;
  code: string;
  fields?: FieldErrors;
  constructor(status: number, code: string, message: string, fields?: FieldErrors) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

const FRIENDLY_OFFLINE =
  "Keine Verbindung. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.";
const FRIENDLY_SERVER =
  "Die Reservierung ist gerade nicht erreichbar. Bitte versuchen Sie es später erneut oder rufen Sie uns an.";

async function request<T>(url: string, init?: RequestInit, timeoutMs = 12000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(url, { ...init, signal: ctrl.signal, headers: { "content-type": "application/json", ...init?.headers } });
  } catch {
    throw new ApiError(0, "network", FRIENDLY_OFFLINE);
  } finally {
    clearTimeout(timer);
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    // never surface raw server errors in the UI
    const message = res.status >= 500 || !body?.message ? FRIENDLY_SERVER : body.message;
    throw new ApiError(res.status, body?.error ?? "unknown", message, body?.fields);
  }
  return body as T;
}

export const api = {
  month: (month: string) => request<MonthResponse>(`/api/availability?month=${month}`),
  day: (date: string) => request<DayResponse>(`/api/availability?date=${date}`),
  reserve: (input: ReservationInput) =>
    request<{ id: string; status: string }>("/api/reservations", { method: "POST", body: JSON.stringify(input) }),
};

// ------------------------------------------------------------------ dates

export const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
export const WEEKDAYS_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const WEEKDAYS_LONG = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

export function formatDateLong(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return `${WEEKDAYS_LONG[d.getUTCDay()]}, ${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}
