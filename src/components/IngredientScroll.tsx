import { useRef } from "react";
import { ingredients } from "../data/content";
import { useHorizontalWheel } from "../hooks/useHorizontalWheel";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";
import "./IngredientScroll.css";

export default function IngredientScroll() {
  const rowRef = useRef<HTMLDivElement | null>(null);
  useHorizontalWheel(rowRef);
  const headingRef = useRevealOnScroll<HTMLDivElement>();

  return (
    <section className="cut" aria-labelledby="cut-heading">
      <div className="container">
        <div ref={headingRef} className="cut__heading reveal-up">
          <span className="eyebrow">The Cut</span>
          <h2 id="cut-heading" className="section-heading">
            Was wirklich <em>drinsteckt.</em>
          </h2>
        </div>
      </div>

      <div className="cut__row" ref={rowRef}>
        <div className="cut__track">
          {ingredients.map((ing, i) => (
            <article className="cut__card" key={ing.id} style={{ ["--i" as string]: i }}>
              <div
                className="cut__swatch"
                style={{ background: `linear-gradient(150deg, ${ing.accent}, ${ing.color})` }}
                aria-hidden="true"
              />
              <h3>{ing.label}</h3>
              <p>{ing.sublabel}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
