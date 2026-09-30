import { useRef } from "react";
import { business, fullAddress, hours, nav } from "../data/content";
import { gsap, scrollToHash } from "../lib/motion";
import Emblem from "./Emblem";
import { Button, useGsap } from "./ui";
import "./Footer.css";
import { site } from "../lib/paths";

export default function Footer() {
  const root = useRef<HTMLElement>(null);

  useGsap(root, ({ reduced, q }) => {
    if (reduced) return;
    gsap.from(q(".footer__word > span"), {
      yPercent: 100,
      stagger: 0.08,
      duration: 1.6,
      ease: "expo.out",
      scrollTrigger: { trigger: q(".footer__word")[0], start: "top 95%", once: true },
    });
    gsap.fromTo(
      q(".footer__lily"),
      { yPercent: 25, rotate: -6 },
      { yPercent: -5, rotate: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: true } },
    );
  });

  const year = new Date().getFullYear();

  return (
    <footer ref={root} className="footer theme-dark" aria-labelledby="footer-title">
      <Emblem className="footer__lily" title="" />
      <div className="container footer__inner">
        <div className="footer__cta">
          <p className="footer__claim serif">
            <em>A presto</em> — bis bald in Wiesdorf.
          </p>
          <Button href="#reservieren" variant="gold" cursor="Reserve">
            Tisch reservieren
          </Button>
        </div>

        <div className="footer__cols">
          <div>
            <p className="label footer__label">Adresse</p>
            <p>{fullAddress}</p>
            <a className="link" href={business.mapsUrl} target="_blank" rel="noopener noreferrer">
              Google Maps ↗
            </a>
          </div>
          <div>
            <p className="label footer__label">Kontakt</p>
            <a className="link" href={business.phoneHref}>
              {business.phoneDisplay}
            </a>
            {business.email && (
              <a className="link" href={`mailto:${business.email}`}>
                {business.email}
              </a>
            )}
            {business.instagram && (
              <a className="link" href={business.instagram.url} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            )}
          </div>
          <div>
            <p className="label footer__label">Öffnungszeiten</p>
            {hours.map((h) => (
              <p key={h.days}>
                {h.short} · {h.time ?? h.note}
              </p>
            ))}
          </div>
          <nav aria-label="Footer">
            <p className="label footer__label">Entdecken</p>
            {nav.map((n) => (
              <a
                key={n.href}
                className="link"
                href={n.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToHash(n.href);
                }}
              >
                {n.label}
              </a>
            ))}
          </nav>
        </div>

        <h2 id="footer-title" className="footer__word display" aria-label="Casa Ducale">
          <span aria-hidden="true">Casa</span>
          <span aria-hidden="true">
            <em>Ducale</em>
          </span>
        </h2>

        <div className="footer__bottom">
          <p>
            © {year} {business.name} · {business.tagline}
          </p>
          <div className="footer__legal">
            <a className="link" href={site("impressum/index.html")}>
              Impressum
            </a>
            <a className="link" href={site("datenschutz/index.html")}>
              Datenschutz
            </a>
            <a
              className="link"
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                scrollToHash("#top");
              }}
            >
              Nach oben ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
