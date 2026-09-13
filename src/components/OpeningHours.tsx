import { deliveryHours, lastOrder, openingHours, type DayHours } from "../data/content";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";
import "./OpeningHours.css";

function HoursTable({ rows }: { rows: DayHours[] }) {
  return (
    <ul className="hours__table">
      {rows.map((row) => (
        <li key={row.label}>
          <span className="hours__day">{row.label}</span>
          <span className="hours__time">
            {row.hours === "closed" ? (
              <span className="hours__closed">Ruhetag</span>
            ) : (
              row.hours.map((h) => <span key={h}>{h}</span>)
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function OpeningHours() {
  const ref = useRevealOnScroll<HTMLDivElement>();

  return (
    <section className="hours" aria-labelledby="hours-heading">
      <div ref={ref} className="container hours__inner reveal-up">
        <div className="hours__heading">
          <span className="eyebrow">Öffnungszeiten</span>
          <h2 id="hours-heading" className="section-heading">
            Wann wir für dich da sind.
          </h2>
        </div>

        <div className="hours__grid">
          <div className="hours__block">
            <h3>Restaurant</h3>
            <HoursTable rows={openingHours} />
          </div>
          <div className="hours__block">
            <h3>Lieferservice</h3>
            <HoursTable rows={deliveryHours} />
            <p className="hours__note">Letzte Bestellung: {lastOrder}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
