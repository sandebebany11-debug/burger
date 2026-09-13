import { useRef } from "react";
import { burgerCategories, contact } from "../data/content";
import { useHorizontalWheel } from "../hooks/useHorizontalWheel";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";
import "./BurgerShowcase.css";

const GLYPH_COLORS: Record<string, [string, string]> = {
  beef: ["#5a3a2a", "#e8a638"],
  chicken: ["#d9b06a", "#f0cf8f"],
  fisch: ["#c9704f", "#e89a78"],
  falafel: ["#6f8a3c", "#9cbf63"],
};

export default function BurgerShowcase() {
  const rowRef = useRef<HTMLDivElement | null>(null);
  useHorizontalWheel(rowRef);
  const headingRef = useRevealOnScroll<HTMLDivElement>();

  return (
    <section id="burger" className="showcase" aria-labelledby="showcase-heading">
      <div className="container">
        <div ref={headingRef} className="showcase__heading reveal-up">
          <span className="eyebrow">Unsere Burger</span>
          <h2 id="showcase-heading" className="section-heading">
            Vier Wege zum <em>dicken Bub</em>.
          </h2>
          <p className="section-lede">
            Beef, Chicken, Lachs oder Falafel – jede Karte beginnt bei uns mit frischen Zutaten
            und endet in der eigenen Küche. Die vollständige Karte mit allen Kombinationen findest
            du im Online-Shop.
          </p>
        </div>
      </div>

      <div className="showcase__row" ref={rowRef}>
        <div className="showcase__track">
          {burgerCategories.map((cat, i) => {
            const [base, accent] = GLYPH_COLORS[cat.id] ?? ["#5a3a2a", "#e8a638"];
            return (
              <article className="showcase__card" key={cat.id} style={{ ["--i" as string]: i }}>
                <div className="showcase__glyph" aria-hidden="true">
                  <span className="showcase__ring" style={{ background: `radial-gradient(circle at 35% 30%, ${accent}, ${base})` }} />
                </div>
                <h3>{cat.name}</h3>
                <p>{cat.description}</p>
                <ul className="showcase__tags">
                  {cat.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </article>
            );
          })}
          <article className="showcase__card showcase__card--cta">
            <p>Die komplette Karte mit allen Burgern und Preisen wartet im Online-Shop.</p>
            <a className="btn btn-outline-gold" href={contact.shopUrl} target="_blank" rel="noopener noreferrer">
              Zur Speisekarte
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
