import { useRef, useState } from "react";
import { business, fullAddress, hours } from "../data/content";
import { gsap } from "../lib/motion";
import { site } from "../lib/paths";
import Emblem from "./Emblem";
import { ClockIcon, OpenBadge, PhoneIcon, PinIcon } from "./Icons";
import { Button, useGsap } from "./ui";
import "./Footer.css";

const MAP_CONSENT = "cd-map-consent";
const MAP_EMBED = `https://maps.google.com/maps?q=${encodeURIComponent(`Casa Ducale, ${fullAddress}`)}&z=16&output=embed`;

function readConsent(): boolean {
  try {
    return localStorage.getItem(MAP_CONSENT) === "1";
  } catch {
    return false;
  }
}

/** Contact + map + footer in one calm block. */
export default function Footer() {
  const root = useRef<HTMLElement>(null);
  const [showMap, setShowMap] = useState(readConsent);

  useGsap(root, ({ reduced, q }) => {
    if (reduced) return;
    gsap.from(q(".footer__brand > *, .contact-item, .map-card"), {
      opacity: 0,
      y: 28,
      stagger: 0.08,
      duration: 1.1,
      ease: "expo.out",
      scrollTrigger: { trigger: root.current, start: "top 80%", once: true },
    });
  });

  const loadMap = () => {
    setShowMap(true);
    try {
      localStorage.setItem(MAP_CONSENT, "1");
    } catch {
      /* private mode */
    }
  };

  return (
    <footer id="besuch" ref={root} className="footer" aria-labelledby="footer-title">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Emblem className="footer__lily" title="" sizes="72px" />
          <h2 id="footer-title" className="footer__name">
            Casa Ducale
          </h2>
          <p className="label footer__tag">Cucina Italiana</p>
        </div>

        <div className="footer__grid">
          <ul className="contact">
            <li className="contact-item">
              <span className="contact-item__icon">
                <PinIcon />
              </span>
              <div>
                <p className="contact-item__label">Adresse</p>
                <p>{business.street}</p>
                <p>
                  {business.postalCode} {business.city}-{business.district}
                </p>
              </div>
            </li>
            <li className="contact-item">
              <span className="contact-item__icon">
                <ClockIcon />
              </span>
              <div>
                <p className="contact-item__label">Öffnungszeiten</p>
                {hours.map((h) => (
                  <p key={h.days}>
                    {h.days}: {h.time ? `${h.time} Uhr` : h.note}
                  </p>
                ))}
                <OpenBadge className="contact-item__status" />
              </div>
            </li>
            <li className="contact-item">
              <span className="contact-item__icon">
                <PhoneIcon />
              </span>
              <div>
                <p className="contact-item__label">Telefon</p>
                <a className="contact-item__phone" href={business.phoneHref}>
                  {business.phoneDisplay}
                </a>
              </div>
            </li>
            <li className="contact-item contact-item--cta">
              <Button href="#reservieren" variant="gold" cursor="Reserve">
                Tisch reservieren
              </Button>
            </li>
          </ul>

          <div className="map-card">
            {showMap ? (
              <iframe
                className="map-card__frame"
                title={`Karte: ${fullAddress}`}
                src={MAP_EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            ) : (
              <a className="map-card__preview" href={business.mapsUrl} target="_blank" rel="noopener noreferrer" data-cursor="Route">
                <span className="map-card__grid" aria-hidden="true" />
                <span className="map-card__pin" aria-hidden="true">
                  <PinIcon />
                </span>
                <span className="map-card__label">
                  <strong>Casa Ducale</strong>
                  {business.street}, {business.city}
                </span>
              </a>
            )}
            <div className="map-card__bar">
              <a className="map-card__route" href={business.mapsUrl} target="_blank" rel="noopener noreferrer">
                Route in Google Maps öffnen ↗
              </a>
              {!showMap && (
                <button type="button" className="map-card__load" onClick={loadMap}>
                  Karte hier anzeigen
                </button>
              )}
            </div>
            {!showMap && (
              <p className="map-card__note">
                Beim Anzeigen der Karte werden Daten an Google übertragen (
                <a href={site("datenschutz/index.html")}>Datenschutz</a>).
              </p>
            )}
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Casa Ducale</span>
          <a className="link" href={site("impressum/index.html")}>
            Impressum
          </a>
          <a className="link" href={site("datenschutz/index.html")}>
            Datenschutz
          </a>
        </div>
      </div>
    </footer>
  );
}
