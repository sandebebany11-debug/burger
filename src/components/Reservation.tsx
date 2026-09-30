import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_SETTINGS, validateReservation, type DayState, type FieldErrors, type SlotState } from "../../shared/reservations";
import { business } from "../data/content";
import { api, ApiError, formatDateLong, MONTHS, monthKey, shiftMonth, WEEKDAYS_SHORT, type Meta } from "../lib/api";
import { gsap, prefersReducedMotion } from "../lib/motion";
import { OCCASION_EVENT } from "./Events";
import { Button, Lines, revealOnScroll, useGsap } from "./ui";
import "./Reservation.css";

type Phase = "form" | "sending" | "sent";

const DAY_LABEL: Record<DayState, string> = {
  available: "verfügbar",
  limited: "wenige Plätze frei",
  full: "ausgebucht",
  closed: "nicht verfügbar",
};
const SLOT_LABEL: Record<SlotState, string> = {
  available: "frei",
  limited: "wenige Plätze",
  full: "ausgebucht",
  blocked: "nicht verfügbar",
};

const OCCASIONS = ["", "Geburtstag", "Jahrestag", "Geschäftsessen", "Feier / Catering", "Sonstiges"];

export default function Reservation() {
  const root = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const [meta, setMeta] = useState<Meta | null>(null);
  const [month, setMonth] = useState<string | null>(null);
  const [days, setDays] = useState<Record<string, DayState>>({});
  const [monthState, setMonthState] = useState<"idle" | "loading" | "error">("idle");
  const [monthError, setMonthError] = useState("");

  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<{ time: string; state: SlotState }[]>([]);
  const [slotsState, setSlotsState] = useState<"idle" | "loading" | "error">("idle");
  const [time, setTime] = useState<string | null>(null);

  const [guests, setGuests] = useState(2);
  const [fields, setFields] = useState({ name: "", phone: "", email: "", message: "", occasion: "", website: "" });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [started, setStarted] = useState(false);

  const maxParty = meta?.maxPartySize ?? DEFAULT_SETTINGS.maxPartySize;

  useGsap(root, ({ reduced, q }) => {
    if (reduced) return;
    revealOnScroll(q(".resv__title .line-mask > span"), q(".resv__intro")[0]);
    gsap.from(q(".resv__card"), {
      y: 80,
      opacity: 0,
      duration: 1.4,
      ease: "expo.out",
      scrollTrigger: { trigger: q(".resv__card")[0], start: "top 90%", once: true },
    });
  });

  // load availability lazily, once the section approaches the viewport
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const loadMonth = useCallback(async (m: string | null) => {
    setMonthState("loading");
    try {
      // first call without a month is answered with today's month via meta
      let res = await api.month(m ?? new Date().toISOString().slice(0, 7));
      if (!m) {
        const bookable = Object.values(res.days).filter((d) => d === "available" || d === "limited").length;
        if (bookable < 3) res = await api.month(shiftMonth(res.month, 1));
      }
      setMeta({ maxPartySize: res.maxPartySize, bookingHorizonDays: res.bookingHorizonDays, today: res.today });
      setDays(res.days);
      setMonth(res.month);
      setMonthState("idle");
    } catch (err) {
      setMonthError(err instanceof ApiError ? err.message : "Die Verfügbarkeit konnte nicht geladen werden.");
      setMonthState("error");
    }
  }, []);

  useEffect(() => {
    if (started) void loadMonth(null);
  }, [started, loadMonth]);

  const loadSlots = useCallback(async (d: string) => {
    setSlotsState("loading");
    setSlots([]);
    try {
      const res = await api.day(d);
      setSlots(res.slots);
      setSlotsState("idle");
      setDays((prev) => ({ ...prev, [d]: res.state }));
    } catch {
      setSlotsState("error");
    }
  }, []);

  const pickDate = (d: string) => {
    touched();
    setDate(d);
    setTime(null);
    setErrors((e) => ({ ...e, date: undefined, time: undefined }));
    void loadSlots(d);
  };

  // "Feier anfragen" pre-selects the occasion
  useEffect(() => {
    const on = (e: Event) => setFields((f) => ({ ...f, occasion: (e as CustomEvent<string>).detail }));
    window.addEventListener(OCCASION_EVENT, on);
    return () => window.removeEventListener(OCCASION_EVENT, on);
  }, []);

  // once the guest starts correcting, the summary error has served its purpose
  const touched = () => setFormError("");

  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    touched();
    setFields((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k as keyof FieldErrors]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phase === "sending") return;
    setFormError("");
    const input = { date: date ?? "", time: time ?? "", guests, ...fields, consent };
    const v = validateReservation(input, { ...DEFAULT_SETTINGS, maxPartySize: maxParty });
    setErrors(v);
    if (Object.keys(v).length) {
      const firstKey = ["date", "time", "guests", "name", "phone", "email", "message", "consent"].find((k) => v[k as keyof FieldErrors]);
      const target = formRef.current?.querySelector<HTMLElement>(`[data-field="${firstKey}"]`);
      target?.focus();
      setFormError("Bitte prüfen Sie die markierten Angaben.");
      return;
    }
    setPhase("sending");
    try {
      await api.reserve(input);
      setPhase("sent");
    } catch (err) {
      setPhase("form");
      if (err instanceof ApiError) {
        if (err.fields) setErrors(err.fields);
        setFormError(err.message);
        if (err.code === "slot_full" || err.code === "slot_unavailable") {
          setTime(null);
          if (date) void loadSlots(date);
        }
      } else setFormError("Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.");
    }
  };

  useEffect(() => {
    if (phase !== "sent" || !successRef.current) return;
    successRef.current.focus();
    if (!prefersReducedMotion())
      gsap.from(successRef.current.querySelectorAll(".resv-done > *"), { opacity: 0, y: 24, stagger: 0.08, duration: 1, ease: "expo.out" });
  }, [phase]);

  const reset = () => {
    setPhase("form");
    setDate(null);
    setTime(null);
    setSlots([]);
    setFields({ name: "", phone: "", email: "", message: "", occasion: "", website: "" });
    setConsent(false);
    if (month) void loadMonth(month);
  };

  // ------------------------------------------------------------ calendar
  const grid = useMemo(() => {
    if (!month) return [];
    const [y, m] = month.split("-").map(Number);
    const first = new Date(Date.UTC(y, m - 1, 1));
    const lead = (first.getUTCDay() + 6) % 7; // Monday-first
    const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const cells: (string | null)[] = Array(lead).fill(null);
    for (let d = 1; d <= count; d++) cells.push(`${month}-${String(d).padStart(2, "0")}`);
    return cells;
  }, [month]);

  const canPrev = !!(month && meta && month > monthKey(meta.today));
  const lastMonth = meta ? monthKey(new Date(Date.parse(`${meta.today}T12:00:00Z`) + meta.bookingHorizonDays * 86400000).toISOString()) : null;
  const canNext = !!(month && lastMonth && month < lastMonth);

  const [y, mIdx] = month ? [month.slice(0, 4), Number(month.slice(5, 7)) - 1] : ["", 0];

  const summary = [date && formatDateLong(date), time && `${time} Uhr`, `${guests} ${guests === 1 ? "Person" : "Personen"}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <section id="reservieren" ref={root} className="resv" aria-labelledby="resv-title">
      <div className="container resv__grid">
        <div className="resv__intro">
          <p className="label eyebrow resv__eyebrow">07 — Prenotazione</p>
          <h2 id="resv-title" className="h2 resv__title">
            <Lines lines={["Tisch", <em key="r">reservieren.</em>]} />
          </h2>
          <p className="lead resv__lead">Wählen Sie Tag, Uhrzeit und Personenzahl — wir kümmern uns um den Rest.</p>
          <ol className="resv__how">
            <li>
              <span>1</span>Anfrage senden
            </li>
            <li>
              <span>2</span>Wir prüfen und bestätigen
            </li>
            <li>
              <span>3</span>Buon appetito
            </li>
          </ol>
          <p className="muted resv__note">
            Ihre Anfrage ist erst nach unserer Bestätigung verbindlich. Für Gruppen über {maxParty} Personen, Feiern oder
            kurzfristige Reservierungen erreichen Sie uns telefonisch unter{" "}
            <a className="link link--static" href={business.phoneHref}>
              {business.phoneDisplay}
            </a>
            .
          </p>
        </div>

        <div className="resv__card" ref={successRef} tabIndex={-1} aria-live="polite">
          {phase === "sent" ? (
            <div className="resv-done">
              <p className="label label--gold">Anfrage gesendet</p>
              <p className="resv-done__title h2">
                <em>Grazie</em>, {fields.name.split(" ")[0]}.
              </p>
              <p className="resv-done__summary">{summary}</p>
              <p className="muted">
                Wir haben Ihre Anfrage erhalten und melden uns zur Bestätigung per Telefon oder E-Mail. Bis dahin ist
                die Reservierung noch nicht verbindlich.
              </p>
              <Button onClick={reset} variant="ghost" small>
                Weitere Anfrage
              </Button>
            </div>
          ) : (
            <form ref={formRef} className="resv-form" onSubmit={submit} noValidate>
              {/* ---------------------------------------------------- step 1 */}
              <fieldset className="resv-step">
                <legend className="resv-step__legend">
                  <span className="resv-step__n">01</span> Datum
                </legend>

                <div className="cal" data-field="date" tabIndex={-1}>
                  <div className="cal__head">
                    <button type="button" className="cal__nav" onClick={() => month && loadMonth(shiftMonth(month, -1))} disabled={!canPrev} aria-label="Vorheriger Monat">
                      <svg viewBox="0 0 24 24" width="18"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
                    </button>
                    <p className="cal__month" aria-live="polite">
                      {month ? (
                        <>
                          <em>{MONTHS[mIdx]}</em> {y}
                        </>
                      ) : (
                        " "
                      )}
                    </p>
                    <button type="button" className="cal__nav" onClick={() => month && loadMonth(shiftMonth(month, 1))} disabled={!canNext} aria-label="Nächster Monat">
                      <svg viewBox="0 0 24 24" width="18"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
                    </button>
                  </div>

                  {monthState === "error" ? (
                    <div className="cal__error" role="alert">
                      <p>{monthError}</p>
                      <button type="button" className="link link--static" onClick={() => loadMonth(month)}>
                        Erneut versuchen
                      </button>
                    </div>
                  ) : (
                    <div className={`cal__grid ${monthState === "loading" ? "is-loading" : ""}`} role="group" aria-label="Tage">
                      {WEEKDAYS_SHORT.map((d) => (
                        <span key={d} className="cal__wd" aria-hidden="true">
                          {d}
                        </span>
                      ))}
                      {(grid.length ? grid : Array(35).fill(null)).map((d, i) => {
                        if (!d) return <span key={`e${i}`} className="cal__empty" />;
                        const state = days[d] ?? "closed";
                        const bookable = state === "available" || state === "limited";
                        const selected = d === date;
                        return (
                          <button
                            key={d}
                            type="button"
                            className={`cal__day is-${state} ${selected ? "is-selected" : ""} ${d === meta?.today ? "is-today" : ""}`}
                            disabled={!bookable}
                            aria-pressed={selected}
                            aria-label={`${formatDateLong(d)} – ${DAY_LABEL[state]}`}
                            onClick={() => pickDate(d)}
                          >
                            {Number(d.slice(8))}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <ul className="cal__legend" aria-hidden="true">
                    <li className="is-available">Verfügbar</li>
                    <li className="is-limited">Wenige Plätze</li>
                    <li className="is-full">Ausgebucht</li>
                    <li className="is-closed">Nicht verfügbar</li>
                  </ul>
                </div>
                {errors.date && <p className="field-error" role="alert">{errors.date}</p>}
              </fieldset>

              {/* ---------------------------------------------------- step 2 */}
              <fieldset className="resv-step">
                <legend className="resv-step__legend">
                  <span className="resv-step__n">02</span> Uhrzeit &amp; Personen
                </legend>

                <div className="slots" data-field="time" tabIndex={-1}>
                  {!date && <p className="slots__hint muted">Bitte wählen Sie zuerst ein Datum.</p>}
                  {date && slotsState === "loading" && <p className="slots__hint muted">Freie Zeiten werden geladen …</p>}
                  {date && slotsState === "error" && (
                    <p className="slots__hint field-error" role="alert">
                      Die Zeiten konnten nicht geladen werden.{" "}
                      <button type="button" className="link link--static" onClick={() => loadSlots(date)}>
                        Erneut versuchen
                      </button>
                    </p>
                  )}
                  {date && slotsState === "idle" && slots.every((s) => s.state === "full" || s.state === "blocked") && (
                    <p className="slots__hint muted">An diesem Tag sind leider keine Zeiten mehr frei. Bitte wählen Sie einen anderen Tag.</p>
                  )}
                  {date && slotsState === "idle" && slots.length > 0 && (
                    <div className="slots__grid" role="radiogroup" aria-label={`Uhrzeiten am ${formatDateLong(date)}`}>
                      {slots.map((s) => {
                        const ok = s.state === "available" || s.state === "limited";
                        return (
                          <button
                            key={s.time}
                            type="button"
                            role="radio"
                            aria-checked={time === s.time}
                            disabled={!ok}
                            className={`slot is-${s.state} ${time === s.time ? "is-selected" : ""}`}
                            onClick={() => {
                              touched();
                              setTime(s.time);
                              setErrors((x) => ({ ...x, time: undefined }));
                            }}
                            aria-label={`${s.time} Uhr – ${SLOT_LABEL[s.state]}`}
                          >
                            {s.time}
                            {s.state === "limited" && <span className="slot__dot" aria-hidden="true" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {errors.time && <p className="field-error" role="alert">{errors.time}</p>}

                <div className="guests" data-field="guests" tabIndex={-1}>
                  <span className="guests__label" id="guests-label">
                    Personen
                  </span>
                  <div className="guests__ctrl" role="group" aria-labelledby="guests-label">
                    <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} disabled={guests <= 1} aria-label="Eine Person weniger">
                      −
                    </button>
                    <output aria-live="polite">{guests}</output>
                    <button type="button" onClick={() => setGuests((g) => Math.min(maxParty, g + 1))} disabled={guests >= maxParty} aria-label="Eine Person mehr">
                      +
                    </button>
                  </div>
                </div>
                {guests >= maxParty && (
                  <p className="muted resv-hint">
                    Mehr als {maxParty} Personen? Bitte rufen Sie uns an: <a className="link link--static" href={business.phoneHref}>{business.phoneDisplay}</a>
                  </p>
                )}
                {errors.guests && <p className="field-error" role="alert">{errors.guests}</p>}
              </fieldset>

              {/* ---------------------------------------------------- step 3 */}
              <fieldset className="resv-step">
                <legend className="resv-step__legend">
                  <span className="resv-step__n">03</span> Ihre Angaben
                </legend>
                <div className="fields">
                  <Field id="r-name" label="Name" error={errors.name} field="name">
                    <input id="r-name" data-field="name" autoComplete="name" value={fields.name} onChange={set("name")} required maxLength={80} aria-invalid={!!errors.name} aria-describedby={errors.name ? "r-name-err" : undefined} />
                  </Field>
                  <Field id="r-phone" label="Telefon" error={errors.phone} field="phone">
                    <input id="r-phone" data-field="phone" type="tel" inputMode="tel" autoComplete="tel" value={fields.phone} onChange={set("phone")} required maxLength={24} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "r-phone-err" : undefined} />
                  </Field>
                  <Field id="r-email" label="E-Mail" error={errors.email} field="email" wide>
                    <input id="r-email" data-field="email" type="email" inputMode="email" autoComplete="email" value={fields.email} onChange={set("email")} required maxLength={120} aria-invalid={!!errors.email} aria-describedby={errors.email ? "r-email-err" : undefined} />
                  </Field>
                  <Field id="r-occasion" label="Anlass (optional)" field="occasion" wide>
                    <select id="r-occasion" value={fields.occasion} onChange={set("occasion")}>
                      {OCCASIONS.map((o) => (
                        <option key={o} value={o}>
                          {o || "Kein besonderer Anlass"}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field id="r-message" label="Nachricht / besondere Wünsche (optional)" error={errors.message} field="message" wide>
                    <textarea id="r-message" data-field="message" rows={3} value={fields.message} onChange={set("message")} maxLength={600} aria-invalid={!!errors.message} />
                  </Field>
                </div>

                {/* honeypot — hidden from people, filled by bots */}
                <div className="hp" aria-hidden="true">
                  <label htmlFor="r-website">Website</label>
                  <input id="r-website" tabIndex={-1} autoComplete="off" value={fields.website} onChange={set("website")} />
                </div>

                <label className={`consent ${errors.consent ? "has-error" : ""}`}>
                  <input
                    type="checkbox"
                    data-field="consent"
                    checked={consent}
                    onChange={(e) => {
                      touched();
                      setConsent(e.target.checked);
                      setErrors((x) => ({ ...x, consent: undefined }));
                    }}
                  />
                  <span className="consent__box" aria-hidden="true" />
                  <span>
                    Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Reservierungsanfrage gespeichert werden.
                    Details in der{" "}
                    <a className="link link--static" href="/datenschutz/" target="_blank" rel="noopener">
                      Datenschutzerklärung
                    </a>
                    .
                  </span>
                </label>
                {errors.consent && <p className="field-error" role="alert">{errors.consent}</p>}
              </fieldset>

              <div className="resv-form__foot">
                <p className="resv-form__summary" aria-live="polite">
                  {summary}
                </p>
                {formError && (
                  <p className="form-error" role="alert">
                    {formError}
                  </p>
                )}
                <Button type="submit" variant="dark" disabled={phase === "sending"} cursor="Reserve" className="resv-form__submit">
                  {phase === "sending" ? "Reservierung wird gesendet …" : "Reservierung anfragen"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  error,
  children,
  wide,
}: {
  id: string;
  label: string;
  error?: string;
  field: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`field ${wide ? "field--wide" : ""} ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && (
        <p id={`${id}-err`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
