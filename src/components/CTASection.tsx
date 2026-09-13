import { contact } from "../data/content";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";
import "./CTASection.css";

export default function CTASection() {
  const ref = useRevealOnScroll<HTMLDivElement>();
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${contact.street}, ${contact.postalCode} ${contact.city}`,
  )}`;

  return (
    <section className="final-cta" aria-labelledby="final-cta-heading">
      <div ref={ref} className="container final-cta__inner reveal-up">
        <h2 id="final-cta-heading" className="final-cta__headline">
          Wir freuen uns auf <em>deine Bestellung!</em>
        </h2>
        <div className="final-cta__actions">
          <a className="btn" href={contact.shopUrl} target="_blank" rel="noopener noreferrer">
            Online bestellen
          </a>
          <a className="btn btn-outline-gold" href={mapUrl} target="_blank" rel="noopener noreferrer">
            Besuchen
          </a>
        </div>
      </div>
    </section>
  );
}
