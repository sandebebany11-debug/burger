import {
  BOOKABLE_SERVICES,
  BOOKING_HORIZON_DAYS,
  STAFF,
  addDays,
  holidayName,
  slotsForDate,
  todayInBerlin,
  type AvailabilityResponse,
  type BookingRequestInput,
  type PublicDay,
} from '../../shared/booking'

// Demo-Termin-API für die Vorschau: rechnet Öffnungszeiten, Feiertage und
// Beispiel-Belegungen im Browser. Es wird nichts gesendet.

const KEY = 'aoh-demo-taken-v2'
type Taken = { date: string; time: string; staff: string | null }
const load = (): Taken[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}
let taken = load()

/** Beispiel-Belegungen je Person, damit alle Kalenderzustände sichtbar sind. */
function sampleBusy(date: string, staff: string): string[] {
  const n = Number(date.slice(8)) + STAFF.findIndex((s) => s.id === staff) * 3
  const slots = slotsForDate(date)
  if (n % 11 === 0) return slots
  if (n % 3 === 0) return slots.filter((_, i) => i % 2 === 0)
  if (n % 4 === 0) return slots.slice(0, 3)
  return []
}

function busyFor(date: string, time: string, staff: string): boolean {
  return sampleBusy(date, staff).includes(time) || taken.some((t) => t.date === date && t.time === time && t.staff === staff)
}

export function demoAvailability(month: string, staff: string | null): AvailabilityResponse {
  const today = todayInBerlin()
  const days: PublicDay[] = []
  for (let d = `${month}-01`; d.startsWith(month); d = addDays(d, 1)) {
    const slots = slotsForDate(d)
    const holiday = holidayName(d)
    if (d <= today) {
      days.push({ date: d, status: 'past', slots: [] })
      continue
    }
    if (d > addDays(today, BOOKING_HORIZON_DAYS) || holiday || slots.length === 0) {
      days.push({ date: d, status: 'closed', label: holiday, slots: [] })
      continue
    }
    const free = slots.map((time) => ({
      time,
      free: staff ? !busyFor(d, time, staff) : STAFF.some((s) => !busyFor(d, time, s.id)),
    }))
    const n = free.filter((s) => s.free).length
    days.push({ date: d, status: n === 0 ? 'full' : n === slots.length ? 'available' : 'partial', slots: free })
  }
  return { month, days }
}

export function demoRequest(input: BookingRequestInput) {
  if (!(BOOKABLE_SERVICES as readonly string[]).includes(input.service)) throw new Error('Bitte wählen Sie eine Leistung.')
  if (input.time && input.staff) {
    taken = [...taken, { date: input.date, time: input.time, staff: input.staff }]
    try {
      localStorage.setItem(KEY, JSON.stringify(taken))
    } catch {
      /* ohne Speicher weiter */
    }
  }
  return { ok: true as const, id: 'demo' }
}
