import { qualityPoints } from "../data/content";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";
import "./QualitySection.css";

export default function QualitySection() {
  const headingRef = useRevealOnScroll<HTMLDivElement>();

  return (
    <section id="qualitaet" className="quality" aria-labelledby="quality-heading">
      <div className="container quality__inner">
        <div className="quality__visual" aria-hidden="true">
          <div className="quality__plate">
            <div className="quality__steam" />
            <div className="quality__steam quality__steam--2" />
            <div className="quality__ring" />
          </div>
        </div>

        <div ref={headingRef} className="quality__copy reveal-up">
          <span className="eyebrow">Qualität &amp; Frische</span>
          <h2 id="quality-heading" className="section-heading">
            Ehrliches Essen, <em>sichtbar gemacht.</em>
          </h2>
          <ul className="quality__list">
            {qualityPoints.map((point, i) => (
              <QualityItem key={point.title} title={point.title} text={point.text} index={i} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function QualityItem({ title, text, index }: { title: string; text: string; index: number }) {
  const ref = useRevealOnScroll<HTMLLIElement>(0.3);
  return (
    <li ref={ref} className="quality__item reveal-up" style={{ transitionDelay: `${index * 0.08}s` }}>
      <span className="quality__index">{String(index + 1).padStart(2, "0")}</span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </li>
  );
}
