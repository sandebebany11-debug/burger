import { useMemo, useRef } from "react";
import { berlinNow, toMinutes, weekdayOf } from "../../shared/reservations";
import { business, hours } from "../data/content";
import { gsap } from "../lib/motion";
import { Button, Lines, revealOnScroll, useGsap } from "./ui";
import "./Visit.css";

function openNow(): { open: boolean; known: boolean } {
  const now = berlinNow();
  const wd = weekdayOf(now.date);
  const row = hours.find((h) => h.weekdays.includes(wd));
  if (!row?.time) return { open: false, known: false };
  const [from, to] = row.time.split("–").map((s) => toMinutes(s.trim()));
  return { open: now.minutes >= from && now.minutes < to, known: true };
}

export default function Visit() {
  const root = useRef<HTMLElement>(null);
  const status = useMemo(() => openNow(), []);
  const todayWd = useMemo(() => weekdayOf(berlinNow().date), []);

  useGsap(root, ({ reduced, q }) => {
    if (reduced) return;
    revealOnScroll(q(".visit__title .line-mask > span"), q(".visit__head")[0]);
    gsap.from(q(".visit__block"), {
      opacity: 0,
      y: 40,
      stagger: 0.1,
      duration: 1.2,
      ease: "expo.out",
      scrollTrigger: { trigger: q(".visit__blocks")[0], start: "top 85%", once: true },
    });
  });

  return (
    <section id="besuch" ref={root} className="visit theme-dark" aria-labelledby="visit-title">
      <div className="container">
        <header className="visit__head">
          <p className="label eyebrow label--gold">08 — Vieni a trovarci</p>
          <h2 id="visit-title" className="h2 visit__title">
            <Lines lines={["Besuchen", <em key="s">Sie uns.</em>]} />
          </h2>
        </header>

        <div className="visit__blocks">
          <address className="visit__block">
            <p className="label visit__label">Adresse</p>
            <p className="visit__big serif">
              {business.street}
              <br />
              {business.postalCode} {business.city}
            </p>
            <p className="muted">
              {business.district}, {business.venue}
            </p>
            <Button href={business.mapsUrl} variant="ghost" className="on-dark" small external>
              Route planen
            </Button>
          </address>

          <div className="visit__block">
            <p className="label visit__label">
              Öffnungszeiten
              {status.known && (
                <span className={`visit__status ${status.open ? "is-open" : ""}`}>
                  {status.open ? "Jetzt geöffnet" : "Jetzt geschlossen"}
                </span>
              )}
            </p>
            <dl className="visit__hours">
              {hours.map((h) => (
                <div key={h.days} className={h.weekdays.includes(todayWd) ? "is-today" : ""}>
                  <dt>{h.days}</dt>
                  <dd>{h.time ? `${h.time} Uhr` : h.note}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="visit__block">
            <p className="label visit__label">Kontakt</p>
            <a className="visit__big serif visit__phone" href={business.phoneHref}>
              {business.phoneDisplay}
            </a>
            {business.email && (
              <a className="link link--static" href={`mailto:${business.email}`}>
                {business.email}
              </a>
            )}
            {business.instagram && (
              <a className="link link--static" href={business.instagram.url} target="_blank" rel="noopener noreferrer">
                Instagram {business.instagram.handle}
              </a>
            )}
            <Button href="#reservieren" variant="gold" small cursor="Reserve">
              Tisch reservieren
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
