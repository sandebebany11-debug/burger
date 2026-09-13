import { brand, contact } from "../data/content";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <span className="site-footer__logo">{brand.name}</span>
          <p>
            {contact.street}, {contact.postalCode} {contact.city}
          </p>
        </div>

        <nav className="site-footer__links" aria-label="Rechtliches">
          <a href="https://derdickebub.de/impressum" target="_blank" rel="noopener noreferrer">
            Impressum
          </a>
          <a href="https://derdickebub.de/datenschutz" target="_blank" rel="noopener noreferrer">
            Datenschutz
          </a>
          <a href="#kontakt">Kontakt</a>
          <a href={contact.shopUrl} target="_blank" rel="noopener noreferrer">
            Online bestellen
          </a>
        </nav>
      </div>
      <div className="container site-footer__meta">
        <span>&copy; {new Date().getFullYear()} {brand.name}</span>
      </div>
    </footer>
  );
}
