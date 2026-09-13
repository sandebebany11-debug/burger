import { contact } from "../data/content";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";
import "./ContactSection.css";

export default function ContactSection() {
  const ref = useRevealOnScroll<HTMLDivElement>();
  const mapQuery = encodeURIComponent(`${contact.street}, ${contact.postalCode} ${contact.city}`);

  return (
    <section id="kontakt" className="contact" aria-labelledby="contact-heading">
      <div ref={ref} className="container contact__inner reveal-up">
        <div className="contact__copy">
          <span className="eyebrow">Kontakt</span>
          <h2 id="contact-heading" className="section-heading">
            Besuch uns in Schlebusch.
          </h2>

          <address className="contact__address">
            {contact.ownerLine}
            <br />
            {contact.street}
            <br />
            {contact.postalCode} {contact.city}
          </address>

          <div className="contact__actions">
            <a className="btn" href={contact.phoneHref}>
              Anrufen
            </a>
            <a className="btn" href={contact.shopUrl} target="_blank" rel="noopener noreferrer">
              Online bestellen
            </a>
            <a className="btn btn-ghost" href={contact.emailHref}>
              E-Mail
            </a>
          </div>

          <ul className="contact__details">
            <li>
              <span>Telefon</span>
              <a href={contact.phoneHref}>{contact.phone}</a>
            </li>
            <li>
              <span>Mobil</span>
              <a href={contact.mobileHref}>{contact.mobile}</a>
            </li>
            <li>
              <span>E-Mail</span>
              <a href={contact.emailHref}>{contact.email}</a>
            </li>
          </ul>
        </div>

        <div className="contact__map">
          <iframe
            title="Der dicke Bub auf der Karte"
            src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
