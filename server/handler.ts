import {
  BOOKABLE_SERVICES,
  BOOKING_HORIZON_DAYS,
  DAY_MODES,
  REQUEST_STATUSES,
  addDays,
  holidayName,
  isIsoDate,
  slotsForDate,
  todayInBerlin,
  type AdminDay,
  type AdminRequest,
  type AdminSlot,
  type AvailabilityResponse,
  type BookingRequestInput,
  type DayMode,
  type DayStatus,
  type PublicDay,
  type RequestStatus,
} from '../shared/booking'
import {
  createSessionToken,
  decrypt,
  encrypt,
  hashIp,
  newId,
  passwordMatches,
  verifySessionToken,
  type Secrets,
} from './security'
import type { KVStore } from './store'

// ---------------------------------------------------------------------------
// Datenmodell im Key-Value-Store
//
//   req/<datum>/<id>        Terminanfrage (Kontaktdaten verschlüsselt)
//   lock/<datum>/<zeit>     Reservierung eines Zeitfensters (verhindert
//                           doppelte Buchungen, atomar über setIfNew)
//   day/<datum>             Einstellungen des Inhabers für einen Tag
//   rl/<zweck>/<ip-hash>    Rate-Limit-Zähler (ohne Klar-IP)
// ---------------------------------------------------------------------------

interface StoredRequest {
  id: string
  createdAt: string
  updatedAt: string
  status: RequestStatus
  service: string
  date: string
  time: string | null
  /** AES-GCM verschlüsselt: { name, phone, email, message } */
  contact: string
  /** AES-GCM verschlüsselt: interne Notiz */
  ownerNote?: string
}

interface Contact {
  name: string
  phone: string
  email: string
  message: string
}

interface DaySettings {
  mode: DayMode
  note: string
  publicNote: string
  blocked: string[]
}

interface SlotLock {
  requestId: string
}

export interface HandlerDeps {
  store: KVStore
  secrets: Secrets
  /** Wird nach einer neuen Anfrage aufgerufen (E-Mail an den Salon). */
  notify?: (req: AdminRequest) => Promise<void>
  now?: () => Date
}

const ACTIVE: RequestStatus[] = ['pending', 'confirmed', 'completed']

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })

const fail = (status: number, error: string) => json({ error }, status)

const clean = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max) : ''

export function createHandler(deps: HandlerDeps) {
  const { store, secrets } = deps
  const now = deps.now ?? (() => new Date())

  // ---- Hilfsfunktionen -----------------------------------------------------

  async function rateLimit(purpose: string, ip: string, max: number, windowMs: number): Promise<boolean> {
    const key = `rl/${purpose}/${hashIp(secrets.ipKey, ip)}`
    const t = now().getTime()
    const entry = (await store.get<{ start: number; count: number }>(key)) ?? { start: t, count: 0 }
    if (t - entry.start > windowMs) {
      entry.start = t
      entry.count = 0
    }
    entry.count++
    await store.set(key, entry)
    return entry.count <= max
  }

  const defaultDay = (): DaySettings => ({ mode: 'auto', note: '', publicNote: '', blocked: [] })

  async function loadDaySettings(date: string): Promise<DaySettings> {
    return { ...defaultDay(), ...((await store.get<DaySettings>(`day/${date}`)) ?? {}) }
  }

  async function loadRequests(prefix: string): Promise<StoredRequest[]> {
    const keys = await store.list(`req/${prefix}`)
    const items = await Promise.all(keys.map((k) => store.get<StoredRequest>(k)))
    return items.filter((r): r is StoredRequest => r !== null)
  }

  function toAdmin(r: StoredRequest): AdminRequest {
    const c = decrypt<Contact>(secrets.encryptionKey, r.contact)
    return {
      id: r.id,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      status: r.status,
      service: r.service,
      date: r.date,
      time: r.time,
      ...c,
      ownerNote: r.ownerNote ? decrypt<string>(secrets.encryptionKey, r.ownerNote) : '',
    }
  }

  function isBookableDate(date: string): boolean {
    const today = todayInBerlin(now())
    return date > today && date <= addDays(today, BOOKING_HORIZON_DAYS)
  }

  /** Berechnet Status und Zeitfenster eines Tages. */
  function computeDay(date: string, settings: DaySettings, requests: StoredRequest[]) {
    const holiday = holidayName(date)
    const slotTimes = slotsForDate(date)
    const active = requests.filter((r) => ACTIVE.includes(r.status))

    const slots: AdminSlot[] = slotTimes.map((time) => {
      if (settings.blocked.includes(time)) return { time, state: 'blocked' }
      const r = active.find((x) => x.time === time)
      if (r) return { time, state: r.status === 'pending' ? 'requested' : 'confirmed', requestId: r.id }
      return { time, state: 'free' }
    })

    let status: DayStatus
    if (!isBookableDate(date)) status = date <= todayInBerlin(now()) ? 'past' : 'closed'
    else if (settings.mode === 'closed' || (settings.mode === 'auto' && (holiday || slotTimes.length === 0)))
      status = 'closed'
    else if (settings.mode !== 'auto') status = settings.mode
    else {
      const free = slots.filter((s) => s.state === 'free').length
      status = free === 0 ? 'full' : free === slots.length ? 'available' : 'partial'
    }
    return { status, slots, holiday }
  }

  function monthDates(month: string): string[] {
    const dates: string[] = []
    let d = `${month}-01`
    while (d.startsWith(month)) {
      dates.push(d)
      d = addDays(d, 1)
    }
    return dates
  }

  async function monthData(month: string) {
    const [requests, dayKeys] = await Promise.all([loadRequests(month), store.list(`day/${month}`)])
    const settingsByDate = new Map<string, DaySettings>()
    await Promise.all(
      dayKeys.map(async (k) => {
        const s = await store.get<DaySettings>(k)
        if (s) settingsByDate.set(k.slice(4), { ...defaultDay(), ...s })
      }),
    )
    return monthDates(month).map((date) => {
      const settings = settingsByDate.get(date) ?? defaultDay()
      const dayRequests = requests.filter((r) => r.date === date)
      return { date, settings, requests: dayRequests, ...computeDay(date, settings, dayRequests) }
    })
  }

  async function acquireLock(date: string, time: string, requestId: string): Promise<boolean> {
    const key = `lock/${date}/${time}`
    if (await store.setIfNew(key, { requestId } satisfies SlotLock)) return true
    // Sperre existiert – ist die zugehörige Anfrage noch aktiv?
    const lock = await store.get<SlotLock>(key)
    if (lock) {
      const holder = await store.get<StoredRequest>(`req/${date}/${lock.requestId}`)
      if (holder && ACTIVE.includes(holder.status) && holder.id !== requestId) return false
    }
    await store.set(key, { requestId } satisfies SlotLock)
    return true
  }

  async function releaseLock(date: string, time: string | null, requestId: string) {
    if (!time) return
    const key = `lock/${date}/${time}`
    const lock = await store.get<SlotLock>(key)
    if (lock?.requestId === requestId) await store.delete(key)
  }

  async function findRequest(id: string): Promise<StoredRequest | null> {
    const key = (await store.list('req/')).find((k) => k.endsWith(`/${id}`))
    return key ? store.get<StoredRequest>(key) : null
  }

  // ---- Öffentliche Endpunkte ----------------------------------------------

  async function getAvailability(url: URL) {
    const month = url.searchParams.get('month') ?? ''
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return fail(400, 'Ungültiger Monat.')
    const days = await monthData(month)
    const body: AvailabilityResponse = {
      month,
      days: days.map(
        (d): PublicDay => ({
          date: d.date,
          status: d.status,
          label: d.settings.publicNote || d.holiday || undefined,
          slots:
            d.status === 'closed' || d.status === 'past'
              ? []
              : d.slots.map((s) => ({ time: s.time, free: s.state === 'free' && d.status !== 'full' })),
        }),
      ),
    }
    return json(body)
  }

  async function createRequest(req: Request, ip: string) {
    let input: BookingRequestInput
    try {
      input = await req.json()
    } catch {
      return fail(400, 'Ungültige Anfrage.')
    }

    // Spam-Schutz: Honeypot + Mindestdauer zum Ausfüllen
    if (input.website) return json({ ok: true })
    if (typeof input.startedAt === 'number' && now().getTime() - input.startedAt < 2500) return json({ ok: true })

    if (!(await rateLimit('request', ip, 5, 3600_000)))
      return fail(429, 'Zu viele Anfragen. Bitte versuchen Sie es später erneut oder rufen Sie uns an.')

    const name = clean(input.name, 80)
    const phone = clean(input.phone, 30)
    const email = clean(input.email, 120).toLowerCase()
    const message = clean(input.message, 1000)
    const service = clean(input.service, 80)
    const date = input.date
    const time = input.time ? clean(input.time, 5) : null

    const errors: Record<string, string> = {}
    if (name.length < 2) errors.name = 'Bitte geben Sie Ihren Namen an.'
    if (!/^[+0-9][0-9 ()/.-]{4,28}$/.test(phone)) errors.phone = 'Bitte geben Sie eine gültige Telefonnummer an.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an.'
    if (!(BOOKABLE_SERVICES as readonly string[]).includes(service)) errors.service = 'Bitte wählen Sie eine Leistung.'
    if (input.consent !== true) errors.consent = 'Bitte bestätigen Sie die Datenschutzhinweise.'
    if (!isIsoDate(date)) errors.date = 'Bitte wählen Sie einen Tag.'
    if (Object.keys(errors).length) return json({ error: 'Bitte prüfen Sie Ihre Angaben.', fields: errors }, 422)

    const [settings, dayRequests] = await Promise.all([loadDaySettings(date), loadRequests(date)])
    const day = computeDay(date, settings, dayRequests)
    if (day.status !== 'available' && day.status !== 'partial')
      return json({ error: 'Dieser Tag ist leider nicht verfügbar.', fields: { date: 'Tag nicht verfügbar.' } }, 409)
    if (time) {
      const slot = day.slots.find((s) => s.time === time)
      if (!slot) return fail(422, 'Ungültige Uhrzeit.')
      if (slot.state !== 'free')
        return json({ error: 'Dieses Zeitfenster ist leider nicht mehr frei.', fields: { time: 'Bereits vergeben.' } }, 409)
    }

    const id = newId()
    if (time && !(await acquireLock(date, time, id)))
      return json({ error: 'Dieses Zeitfenster wurde gerade vergeben.', fields: { time: 'Bereits vergeben.' } }, 409)

    const ts = now().toISOString()
    const stored: StoredRequest = {
      id,
      createdAt: ts,
      updatedAt: ts,
      status: 'pending',
      service,
      date,
      time,
      contact: encrypt(secrets.encryptionKey, { name, phone, email, message } satisfies Contact),
    }
    await store.set(`req/${date}/${id}`, stored)

    if (deps.notify) {
      try {
        await deps.notify(toAdmin(stored))
      } catch (e) {
        console.error('Benachrichtigung fehlgeschlagen', e)
      }
    }
    return json({ ok: true, id }, 201)
  }

  // ---- Admin ---------------------------------------------------------------

  async function login(req: Request, ip: string) {
    if (!secrets.adminPassword) return fail(503, 'Admin-Zugang ist nicht konfiguriert (ADMIN_PASSWORD).')
    if (!(await rateLimit('login', ip, 8, 15 * 60_000))) return fail(429, 'Zu viele Versuche. Bitte später erneut.')
    const body = (await req.json().catch(() => ({}))) as { password?: string }
    if (typeof body.password !== 'string' || !passwordMatches(secrets.adminPassword, body.password))
      return fail(401, 'Passwort falsch.')
    return json({ token: createSessionToken(secrets.sessionKey) })
  }

  async function adminRequests(url: URL) {
    const from = url.searchParams.get('from')
    let list = await loadRequests('')
    if (from && isIsoDate(from)) list = list.filter((r) => r.date >= from)
    const out = list.map(toAdmin).sort((a, b) => (a.date + (a.time ?? '99')).localeCompare(b.date + (b.time ?? '99')))
    return json({ requests: out })
  }

  async function updateRequest(id: string, req: Request) {
    const body = (await req.json().catch(() => ({}))) as { status?: string; ownerNote?: string; time?: string | null }
    const r = await findRequest(id)
    if (!r) return fail(404, 'Anfrage nicht gefunden.')

    const nextStatus = (body.status ?? r.status) as RequestStatus
    if (!REQUEST_STATUSES.includes(nextStatus)) return fail(400, 'Ungültiger Status.')
    const nextTime = body.time === undefined ? r.time : body.time ? clean(body.time, 5) : null
    if (nextTime && !slotsForDate(r.date).includes(nextTime)) return fail(400, 'Ungültige Uhrzeit.')

    const wasActive = ACTIVE.includes(r.status)
    const willBeActive = ACTIVE.includes(nextStatus)

    // Zeitfenster neu belegen, falls nötig – verhindert Doppelbuchungen
    if (willBeActive && nextTime && (!wasActive || nextTime !== r.time)) {
      const settings = await loadDaySettings(r.date)
      if (settings.blocked.includes(nextTime)) return fail(409, 'Dieses Zeitfenster ist blockiert.')
      if (!(await acquireLock(r.date, nextTime, r.id)))
        return fail(409, 'Dieses Zeitfenster ist bereits durch eine andere Anfrage belegt.')
    }
    if (wasActive && r.time && (!willBeActive || nextTime !== r.time)) await releaseLock(r.date, r.time, r.id)

    r.status = nextStatus
    r.time = nextTime
    if (typeof body.ownerNote === 'string') {
      const note = clean(body.ownerNote, 1000)
      r.ownerNote = note ? encrypt(secrets.encryptionKey, note) : undefined
    }
    r.updatedAt = now().toISOString()
    await store.set(`req/${r.date}/${r.id}`, r)
    return json({ request: toAdmin(r) })
  }

  async function deleteRequest(id: string) {
    const r = await findRequest(id)
    if (!r) return fail(404, 'Anfrage nicht gefunden.')
    await releaseLock(r.date, r.time, r.id)
    await store.delete(`req/${r.date}/${r.id}`)
    return json({ ok: true })
  }

  async function adminDays(url: URL) {
    const month = url.searchParams.get('month') ?? ''
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return fail(400, 'Ungültiger Monat.')
    const days = await monthData(month)
    const out: AdminDay[] = days.map((d) => {
      const names = new Map(d.requests.map((r) => [r.id, decrypt<Contact>(secrets.encryptionKey, r.contact).name]))
      return {
        date: d.date,
        mode: d.settings.mode,
        status: d.status,
        note: d.settings.note,
        publicNote: d.settings.publicNote,
        holiday: d.holiday,
        slots: d.slots.map((s) => (s.requestId ? { ...s, name: names.get(s.requestId) } : s)),
        requestCount: d.requests.filter((r) => ACTIVE.includes(r.status)).length,
      }
    })
    return json({ month, days: out })
  }

  async function updateDay(date: string, req: Request) {
    if (!isIsoDate(date)) return fail(400, 'Ungültiges Datum.')
    const body = (await req.json().catch(() => ({}))) as Partial<DaySettings>
    const current = await loadDaySettings(date)
    const valid = slotsForDate(date)
    const next: DaySettings = {
      mode: body.mode && DAY_MODES.includes(body.mode) ? body.mode : current.mode,
      note: typeof body.note === 'string' ? clean(body.note, 500) : current.note,
      publicNote: typeof body.publicNote === 'string' ? clean(body.publicNote, 80) : current.publicNote,
      blocked: Array.isArray(body.blocked) ? [...new Set(body.blocked.filter((t) => valid.includes(t)))] : current.blocked,
    }
    const isDefault = next.mode === 'auto' && !next.note && !next.publicNote && next.blocked.length === 0
    if (isDefault) await store.delete(`day/${date}`)
    else await store.set(`day/${date}`, next)
    return json({ ok: true })
  }

  // ---- Aufräumen (DSGVO-Löschkonzept) ---------------------------------------

  async function cleanup(retentionDays: number) {
    const cutoff = addDays(todayInBerlin(now()), -retentionDays)
    let removed = 0
    for (const key of await store.list('req/')) {
      const date = key.split('/')[1]
      const r = await store.get<StoredRequest>(key)
      const declinedLongAgo = r?.status === 'declined' && r.updatedAt.slice(0, 10) < cutoff
      if (date < cutoff || declinedLongAgo) {
        await store.delete(key)
        removed++
      }
    }
    for (const key of await store.list('lock/')) if (key.split('/')[1] < cutoff) await store.delete(key)
    for (const key of await store.list('day/')) if (key.slice(4) < cutoff) await store.delete(key)
    const dayAgo = now().getTime() - 86400_000
    for (const key of await store.list('rl/')) {
      const e = await store.get<{ start: number }>(key)
      if (!e || e.start < dayAgo) await store.delete(key)
    }
    return removed
  }

  // ---- Router ----------------------------------------------------------------

  async function handle(req: Request, ip = 'unknown'): Promise<Response> {
    const url = new URL(req.url)
    const path = url.pathname.replace(/^\/api/, '').replace(/\/+$/, '')
    const m = req.method

    try {
      if (m === 'GET' && path === '/availability') return await getAvailability(url)
      if (m === 'POST' && path === '/requests') return await createRequest(req, ip)
      if (m === 'POST' && path === '/admin/login') return await login(req, ip)

      if (path.startsWith('/admin/')) {
        const token = req.headers.get('authorization')?.replace(/^Bearer /, '') ?? null
        if (!verifySessionToken(secrets.sessionKey, token)) return fail(401, 'Bitte erneut anmelden.')

        if (m === 'GET' && path === '/admin/requests') return await adminRequests(url)
        if (m === 'GET' && path === '/admin/days') return await adminDays(url)
        const reqMatch = path.match(/^\/admin\/requests\/([\w-]+)$/)
        if (reqMatch && m === 'PATCH') return await updateRequest(reqMatch[1], req)
        if (reqMatch && m === 'DELETE') return await deleteRequest(reqMatch[1])
        const dayMatch = path.match(/^\/admin\/days\/(\d{4}-\d{2}-\d{2})$/)
        if (dayMatch && m === 'PUT') return await updateDay(dayMatch[1], req)
      }
      return fail(404, 'Nicht gefunden.')
    } catch (e) {
      console.error(e)
      return fail(500, 'Interner Fehler. Bitte rufen Sie uns an: 02171 83045')
    }
  }

  return { handle, cleanup }
}

// ---------------------------------------------------------------------------
// E-Mail-Benachrichtigung über Resend (https://resend.com), optional.
// Standardmäßig enthält die Mail KEINE Kontaktdaten des Kunden – der Inhaber
// sieht diese nur im geschützten Admin-Bereich (Datenminimierung).
// ---------------------------------------------------------------------------

export function createNotifier(env: Record<string, string | undefined>) {
  const apiKey = env.RESEND_API_KEY
  const to = env.NOTIFY_EMAIL_TO
  const from = env.NOTIFY_EMAIL_FROM
  if (!apiKey || !to || !from) return undefined
  const includeContact = env.NOTIFY_INCLUDE_CONTACT === 'true'
  const siteUrl = (env.URL ?? '').replace(/\/$/, '')

  return async (r: AdminRequest) => {
    const date = new Date(`${r.date}T12:00:00Z`).toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    })
    const lines = [
      'Neue Terminanfrage über die Website:',
      '',
      `Leistung: ${r.service}`,
      `Wunschtermin: ${date}${r.time ? `, ${r.time} Uhr` : ' (Uhrzeit flexibel)'}`,
      ...(includeContact ? ['', `Name: ${r.name}`, `Telefon: ${r.phone}`, `E-Mail: ${r.email}`] : []),
      '',
      `Details und Bestätigung im Admin-Bereich: ${siteUrl}/admin/`,
    ]
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to, subject: `Neue Terminanfrage – ${r.date}`, text: lines.join('\n') }),
    })
    if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`)
  }
}
