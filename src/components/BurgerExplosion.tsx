import { useState } from "react";
import ScrollStage from "./ScrollStage";
import { renderBurger } from "../lib/burgerRenderer";
import { burgerLayers } from "../data/content";
import "./BurgerExplosion.css";

const CAPTIONS = [
  { at: 0, title: "Ein Burger.", sub: "So wie er sein soll." },
  { at: 0.3, title: "Von Hand gemacht.", sub: "Schicht für Schicht." },
  { at: 0.55, title: "Zutat für Zutat.", sub: "Frisch. Ehrlich. Ohne Kompromisse." },
  { at: 0.85, title: "Der dicke Bub.", sub: "Burger mit Leidenschaft." },
];

export default function BurgerExplosion() {
  const [progress, setProgress] = useState(0);

  const caption = [...CAPTIONS].reverse().find((c) => progress >= c.at) ?? CAPTIONS[0];

  return (
    <section id="the-burger" className="explosion" aria-label="Der Burger in seinen Einzelteilen">
      <ScrollStage
        heightVh={420}
        ariaLabel="Animation: Ein Burger von Der dicke Bub zerlegt sich beim Scrollen in seine Zutaten"
        onProgress={setProgress}
        renderFrame={({ ctx, width, height, progress: p, time, reducedMotion }) =>
          renderBurger(ctx, { width, height, progress: p, time, reducedMotion })
        }
      >
        {(p) => (
          <div className="explosion__overlay container">
            <div className="explosion__caption" key={caption.title}>
              <span className="eyebrow">The Burger</span>
              <h2 className="explosion__title">{caption.title}</h2>
              <p className="explosion__sub">{caption.sub}</p>
            </div>
            <div className="explosion__progress" aria-hidden="true">
              <div className="explosion__progress-bar" style={{ transform: `scaleX(${p})` }} />
            </div>
          </div>
        )}
      </ScrollStage>

      <ul className="visually-hidden">
        {burgerLayers.map((layer) => (
          <li key={layer.id}>
            {layer.label} — {layer.sublabel}
          </li>
        ))}
      </ul>
    </section>
  );
}
