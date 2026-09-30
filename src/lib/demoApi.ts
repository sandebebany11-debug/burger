import {
  BOOKABLE_SERVICES,
  BOOKING_HORIZON_DAYS,
  addDays,
  holidayName,
  slotsForDate,
  todayInBerlin,
  type AvailabilityResponse,
  type BookingRequestInput,
  type PublicDay,
} from '../../shared/booking'

// Demo-Termin-API für die Vorschau: rechnet Öffnungszeiten, Feiertage und
// bereits angefragte Zeitfenster im Browser. Es wird nichts gesendet.

const KEY = 'aoh-demo-taken'
const load = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}
const save = (v: string[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(v))
  } catch {
    /* ohne Speicher weiter */
  }
}
let taken = load()

// Ein paar Beispiel-Belegungen, damit alle Kalenderzustände sichtbar sind
function sampleTaken(date: string): string[] {
  const n = Number(date.slice(8))
  const slots = slotsForDate(date)
  if (n % 9 === 0) return slots
  if (n % 3 === 0) return slots.filter((_, i) => i % 2 === 0)
  if (n % 4 === 0) return slots.slice(0, 3)
  return []
}

export function demoAvailability(month: string): AvailabilityResponse {
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
    const busy = new Set([...sampleTaken(d), ...taken.filter((t) => t.startsWith(d)).map((t) => t.slice(11))])
    const free = slots.filter((s) => !busy.has(s)).length
    days.push({
      date: d,
      status: free === 0 ? 'full' : free === slots.length ? 'available' : 'partial',
      slots: slots.map((time) => ({ time, free: !busy.has(time) })),
    })
  }
  return { month, days }
}

export function demoRequest(input: BookingRequestInput) {
  if (!(BOOKABLE_SERVICES as readonly string[]).includes(input.service)) throw new Error('Bitte wählen Sie eine Leistung.')
  if (input.time) {
    taken = [...taken, `${input.date} ${input.time}`]
    save(taken)
  }
  return { ok: true as const, id: 'demo' }
}
