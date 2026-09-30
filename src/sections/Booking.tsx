import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { BOOKABLE_SERVICES, BOOKING_HORIZON_DAYS, addDays, todayInBerlin, type PublicDay } from '../../shared/booking'
import { Arrow } from '../components/Arrow'
import { Calendar, longDate } from '../components/Calendar'
import { Monogram } from '../components/Monogram'
import { business } from '../data/content'
import { ApiError, getAvailability, sendRequest } from '../lib/api'
import { IS_DEMO, siteUrl } from '../lib/site'
import { gsap, prefersReducedMotion } from '../lib/motion'

type Phase = 'form' | 'sending' | 'done'

const shiftMonth = (month: string, delta: number) => {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + delta, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

/**
 * Terminanfrage in vier Schritten: Leistung → Tag → Uhrzeit (optional) → Kontakt.
 * Es handelt sich um eine unverbindliche Anfrage, der Salon bestätigt.
 */
export function Booking() {
  const today = todayInBerlin()
  const firstMonth = today.slice(0, 7)
  const lastMonth = addDays(today, BOOKING_HORIZON_DAYS).slice(0, 7)

  // Gegen Monatsende direkt den Folgemonat zeigen
  const [month, setMonth] = useState(() => (Number(today.slice(8)) > 22 ? shiftMonth(firstMonth, 1) : firstMonth))
  const [days, setDays] = useState<PublicDay[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [service, setService] = useState('')
  const [date, setDate] = useState<string | null>(null)
  const [time, setTime] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [consent, setConsent] = useState(false)
  const [website, setWebsite] = useState('')
  const [phase, setPhase] = useState<Phase>('form')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const startedAt = useRef(Date.now())
  const doneRef = useRef<HTMLDivElement>(null)
  const slotsRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async (m: string) => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await getAvailability(m)
      setDays(res.days)
    } catch (e) {
      setDays(null)
      setLoadError(e instanceof ApiError ? e.message : 'Kalender konnte nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(month)
  }, [month, load])

  const day = days?.find((d) => d.date === date) ?? null

  // Zeitfenster sanft einblenden
  useEffect(() => {
    if (!date || prefersReducedMotion() || !slotsRef.current) return
    gsap.fromTo(
      slotsRef.current.querySelectorAll('.slot'),
      { y: 12, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.03, ease: 'expo.out' },
    )
  }, [date])

  useEffect(() => {
    if (phase !== 'done' || !doneRef.current) return
    doneRef.current.focus()
    if (prefersReducedMotion()) return
    gsap.from(doneRef.current.children, { y: 30, autoAlpha: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out' })
  }, [phase])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const errs: Record<string, string> = {}
    if (!service) errs.service = 'Bitte wählen Sie eine Leistung.'
    if (!date) errs.date = 'Bitte wählen Sie einen Tag im Kalender.'
    if (name.trim().length < 2) errs.name = 'Bitte geben Sie Ihren Namen an.'
    if (!/^[+0-9][0-9 ()/.-]{4,28}$/.test(phone.trim())) errs.phone = 'Bitte geben Sie eine gültige Telefonnummer an.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) errs.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an.'
    if (!consent) errs.consent = 'Bitte bestätigen Sie die Datenschutzhinweise.'
    setFieldErrors(errs)
    if (Object.keys(errs).length) {
      setError('Bitte prüfen Sie die markierten Angaben.')
      const first = Object.keys(errs)[0]
      document.getElementById(`bk-${first}`)?.focus()
      return
    }

    setPhase('sending')
    try {
      await sendRequest({
        service,
        date: date!,
        time,
        name,
        phone,
        email,
        message,
        consent,
        website,
        startedAt: startedAt.current,
      })
      setPhase('done')
    } catch (err) {
      setPhase('form')
      if (err instanceof ApiError) {
        setError(err.message)
        setFieldErrors(err.fields ?? {})
        if (err.status === 409) {
          setTime(null)
          load(month)
        }
      } else setError('Die Anfrage konnte nicht gesendet werden.')
    }
  }

  const reset = () => {
    setPhase('form')
    setDate(null)
    setTime(null)
    setService('')
    setMessage('')
    startedAt.current = Date.now()
    load(month)
  }

  const steps = [
    { label: 'Leistung', done: !!service },
    { label: 'Tag', done: !!date },
    { label: 'Uhrzeit', done: !!date },
    { label: 'Kontakt', done: name.length > 1 && phone.length > 4 && email.includes('@') },
  ]

  return (
    <section id="termin" className="booking section on-dark grain" aria-labelledby="booking-title">
      <Monogram className="booking__mono" />
      <div className="wrap booking__layout">
        <header className="booking__head">
          <p className="eyebrow">Termin</p>
          <h2 id="booking-title" className="h-lg" data-reveal="text">
            Ihr Termin. <em>Ihre Zeit.</em>
          </h2>
          <p className="lead" data-reveal="fade">
            Wählen Sie Leistung, Wunschtag und – wenn Sie möchten – eine Uhrzeit. Ihre Anfrage ist unverbindlich:
            Wir melden uns persönlich zur Bestätigung.
          </p>
          <ol className="booking__steps" aria-label="Fortschritt">
            {steps.map((s, i) => (
              <li key={s.label} className={s.done ? 'is-done' : ''}>
                <span className="num">0{i + 1}</span> {s.label}
              </li>
            ))}
          </ol>
          <p className="booking__phone">
            Lieber persönlich? <a href={business.phoneHref} className="link-u">{business.phoneDisplay}</a>
          </p>
        </header>

        {phase === 'done' ? (
          <div ref={doneRef} className="booking__done" tabIndex={-1} role="status">
            <span className="booking__check" aria-hidden="true">
              <svg viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="24" />
                <path d="M15 27l7 7 15-16" />
              </svg>
            </span>
            <h3 className="h-lg">
              Vielen Dank, <em>{name.split(' ')[0]}.</em>
            </h3>
            <p className="lead">
              Ihre Anfrage für <strong>{service}</strong> am <strong>{date && longDate(date)}</strong>
              {time ? ` um ${time} Uhr` : ''} ist bei uns eingegangen. Wir prüfen den Termin und melden uns
              telefonisch oder per E-Mail zur Bestätigung.
            </p>
            <button type="button" className="btn btn--ghost" onClick={reset}>
              <span>Weitere Anfrage</span>
            </button>
          </div>
        ) : (
          <form className="booking__form" onSubmit={submit} noValidate>
            {/* 01 Leistung */}
            <fieldset className="bk-step">
              <legend>
                <span className="num">01</span> Gewünschte Leistung
              </legend>
              <div className={`field field--select ${fieldErrors.service ? 'has-error' : ''}`}>
                <label htmlFor="bk-service" className="sr-only">
                  Leistung
                </label>
                <select
                  id="bk-service"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  aria-invalid={!!fieldErrors.service}
                  aria-describedby={fieldErrors.service ? 'err-service' : undefined}
                >
                  <option value="">Bitte wählen …</option>
                  {BOOKABLE_SERVICES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {fieldErrors.service && (
                  <p id="err-service" className="field__error">
                    {fieldErrors.service}
                  </p>
                )}
              </div>
            </fieldset>

            {/* 02 Tag */}
            <fieldset className="bk-step">
              <legend>
                <span className="num">02</span> Wunschtag
              </legend>
              <div id="bk-date" tabIndex={-1} className={fieldErrors.date ? 'has-error' : ''}>
                <Calendar
                  month={month}
                  days={days}
                  loading={loading}
                  selected={date}
                  onSelect={(d) => {
                    setDate(d)
                    setTime(null)
                  }}
                  onPrev={() => setMonth((m) => shiftMonth(m, -1))}
                  onNext={() => setMonth((m) => shiftMonth(m, 1))}
                  canPrev={month > firstMonth}
                  canNext={month < lastMonth}
                />
                {loadError && (
                  <p className="field__error" role="alert">
                    {loadError} Sie erreichen uns telefonisch unter{' '}
                    <a href={business.phoneHref}>{business.phoneDisplay}</a>.
                  </p>
                )}
                {fieldErrors.date && <p className="field__error">{fieldErrors.date}</p>}
              </div>
            </fieldset>

            {/* 03 Uhrzeit */}
            <fieldset className="bk-step" disabled={!day}>
              <legend>
                <span className="num">03</span> Uhrzeit <small>(optional)</small>
              </legend>
              {day ? (
                <div ref={slotsRef} className="slots" role="radiogroup" aria-label={`Uhrzeiten am ${longDate(day.date)}`}>
                  <p className="slots__date">{longDate(day.date)}</p>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={time === null}
                    className={`slot slot--flex ${time === null ? 'is-active' : ''}`}
                    onClick={() => setTime(null)}
                  >
                    Flexibel
                  </button>
                  {day.slots.map((s) => (
                    <button
                      key={s.time}
                      type="button"
                      role="radio"
                      aria-checked={time === s.time}
                      disabled={!s.free}
                      className={`slot ${time === s.time ? 'is-active' : ''}`}
                      onClick={() => setTime(s.time)}
                      aria-label={`${s.time} Uhr${s.free ? '' : ' – vergeben'}`}
                    >
                      {s.time}
                    </button>
                  ))}
                  {fieldErrors.time && <p className="field__error">{fieldErrors.time}</p>}
                </div>
              ) : (
                <p className="slots__hint">Bitte wählen Sie zuerst einen Tag im Kalender.</p>
              )}
            </fieldset>

            {/* 04 Kontakt */}
            <fieldset className="bk-step">
              <legend>
                <span className="num">04</span> Ihre Kontaktdaten
              </legend>
              <div className="fields">
                <Field id="name" label="Name" value={name} onChange={setName} error={fieldErrors.name} autoComplete="name" />
                <Field
                  id="phone"
                  label="Telefon"
                  type="tel"
                  value={phone}
                  onChange={setPhone}
                  error={fieldErrors.phone}
                  autoComplete="tel"
                  inputMode="tel"
                />
                <Field
                  id="email"
                  label="E-Mail"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  error={fieldErrors.email}
                  autoComplete="email"
                  wide
                />
                <Field id="message" label="Nachricht / Wunsch (optional)" value={message} onChange={setMessage} textarea wide />
              </div>

              {/* Honeypot für Bots – für Menschen unsichtbar */}
              <div className="hp" aria-hidden="true">
                <label htmlFor="bk-website">Website</label>
                <input id="bk-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>

              <label className={`consent ${fieldErrors.consent ? 'has-error' : ''}`}>
                <input id="bk-consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span className="consent__box" aria-hidden="true" />
                <span>
                  Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Terminanfrage gespeichert und
                  verwendet werden. Die Daten werden verschlüsselt gespeichert und spätestens 30 Tage nach dem Termin
                  gelöscht. Mehr in der{' '}
                  <a href={siteUrl('/datenschutz/')} className="link-u" target="_blank" rel="noopener">
                    Datenschutzerklärung
                  </a>
                  .
                </span>
              </label>
              {fieldErrors.consent && <p className="field__error">{fieldErrors.consent}</p>}
            </fieldset>

            <div className="booking__submit">
              {error && (
                <p className="booking__error" role="alert">
                  {error}
                </p>
              )}
              <button type="submit" className="btn btn--gold btn--large" disabled={phase === 'sending'} data-cursor="Senden">
                <span>{phase === 'sending' ? 'Wird gesendet …' : 'Termin anfragen'}</span>
                <span className="btn-arrow">
                  <Arrow />
                </span>
              </button>
              <p className="booking__fine">
                {IS_DEMO
                  ? 'Vorschau: Anfragen werden hier nicht gesendet'
                  : 'Unverbindliche Anfrage · Bestätigung durch den Salon'}
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

interface FieldProps {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  type?: string
  textarea?: boolean
  wide?: boolean
  autoComplete?: string
  inputMode?: 'tel' | 'email' | 'text'
}

function Field({ id, label, value, onChange, error, type = 'text', textarea, wide, autoComplete, inputMode }: FieldProps) {
  const fid = `bk-${id}`
  const props = {
    id: fid,
    value,
    placeholder: ' ',
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
    'aria-invalid': !!error,
    'aria-describedby': error ? `err-${id}` : undefined,
    autoComplete,
  }
  return (
    <div className={`field ${wide ? 'field--wide' : ''} ${error ? 'has-error' : ''} ${value ? 'has-value' : ''}`}>
      {textarea ? <textarea rows={3} maxLength={1000} {...props} /> : <input type={type} inputMode={inputMode} {...props} />}
      <label htmlFor={fid}>{label}</label>
      <span className="field__line" aria-hidden="true" />
      {error && (
        <p id={`err-${id}`} className="field__error">
          {error}
        </p>
      )}
    </div>
  )
}
