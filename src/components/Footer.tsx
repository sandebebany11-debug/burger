import { useRef } from "react";
import { business, fullAddress, hours } from "../data/content";
import { gsap } from "../lib/motion";
import { site } from "../lib/paths";
import Emblem from "./Emblem";
import { Button, useGsap } from "./ui";
import "./Footer.css";

/** Contact + footer in one calm block: who, where, when, how to reach us. */
export default function Footer() {
  const root = useRef<HTMLElement>(null);

  useGsap(root, ({ reduced, q }) => {
    if (reduced) return;
    gsap.from(q(".footer__brand > *, .footer__row, .footer__cta"), {
      opacity: 0,
      y: 24,
      stagger: 0.08,
      duration: 1.1,
      ease: "expo.out",
      scrollTrigger: { trigger: root.current, start: "top 80%", once: true },
    });
  });

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

        <dl className="footer__info">
          <div className="footer__row">
            <dt>Adresse</dt>
            <dd>
              {fullAddress}
              <a className="link link--static footer__route" href={business.mapsUrl} target="_blank" rel="noopener noreferrer">
                Route planen
              </a>
            </dd>
          </div>
          <div className="footer__row">
            <dt>Öffnungszeiten</dt>
            <dd>
              {hours.map((h) => (
                <span key={h.days} className="footer__hours">
                  {h.days}: {h.time ? `${h.time} Uhr` : h.note}
                </span>
              ))}
            </dd>
          </div>
          <div className="footer__row">
            <dt>Telefon</dt>
            <dd>
              <a className="footer__phone" href={business.phoneHref}>
                {business.phoneDisplay}
              </a>
            </dd>
          </div>
        </dl>

        <div className="footer__cta">
          <Button href="#reservieren" variant="gold" cursor="Reserve">
            Tisch reservieren
          </Button>
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
