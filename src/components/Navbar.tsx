import { useEffect, useRef, useState } from "react";
import { brand, contact, nav } from "../data/content";
import "./Navbar.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", open);
    return () => document.body.classList.remove("no-scroll");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
        <div className="navbar__inner container">
          <a href="#top" className="navbar__logo">
            {brand.name}
          </a>
          <nav className="navbar__links" aria-label="Hauptnavigation">
            {nav.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="navbar__actions">
            <a className="btn navbar__cta" href={contact.shopUrl} target="_blank" rel="noopener noreferrer">
              Online bestellen
            </a>
            <button
              ref={toggleRef}
              type="button"
              className="navbar__burger"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Menü schließen" : "Menü öffnen"}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div id="mobile-menu" className={`mobile-menu${open ? " mobile-menu--open" : ""}`} aria-hidden={!open}>
        <nav aria-label="Mobile Navigation" className="mobile-menu__nav">
          {nav.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              style={{ transitionDelay: open ? `${0.08 * i + 0.1}s` : "0s" }}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          className="btn mobile-menu__cta"
          style={{ transitionDelay: open ? `${0.08 * nav.length + 0.1}s` : "0s" }}
          href={contact.shopUrl}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={open ? 0 : -1}
        >
          Online bestellen
        </a>
      </div>
    </>
  );
}
