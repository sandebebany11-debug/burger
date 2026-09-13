import { useState } from "react";
import { burgerLayers } from "../data/content";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";
import "./BurgerBuilder.css";

type ToggleKey = "cheese" | "onion" | "lettuce" | "sauce";

const TOGGLES: { key: ToggleKey; label: string; layerIds: string[] }[] = [
  { key: "cheese", label: "Cheddar", layerIds: ["cheese"] },
  { key: "onion", label: "Röstzwiebeln", layerIds: ["onion"] },
  { key: "lettuce", label: "Frisches Gemüse", layerIds: ["lettuce"] },
  { key: "sauce", label: "Bub-Sauce", layerIds: ["sauce-1", "sauce-2"] },
];

export default function BurgerBuilder() {
  const [active, setActive] = useState<Record<ToggleKey, boolean>>({
    cheese: true,
    onion: true,
    lettuce: true,
    sauce: true,
  });
  const ref = useRevealOnScroll<HTMLDivElement>();

  const toggle = (key: ToggleKey) => setActive((a) => ({ ...a, [key]: !a[key] }));

  const isLayerActive = (id: string) => {
    if (id === "bun-top" || id === "bun-bottom" || id === "patty") return true;
    const toggle = TOGGLES.find((t) => t.layerIds.includes(id));
    return toggle ? active[toggle.key] : true;
  };

  return (
    <section className="builder" aria-labelledby="builder-heading">
      <div ref={ref} className="container builder__inner reveal-up">
        <div className="builder__copy">
          <span className="eyebrow">Stell dir deinen Bub zusammen</span>
          <h2 id="builder-heading" className="section-heading">
            Dein Burger. <br />
            <em>Deine Regeln.</em>
          </h2>
          <p className="section-lede">
            Patty und Brötchen bleiben – bei allem anderen entscheidest du. Tippe auf eine Zutat
            und beobachte, wie sich dein Bub in Echtzeit verändert.
          </p>
          <div className="builder__toggles" role="group" aria-label="Zutaten an- oder abwählen">
            {TOGGLES.map((t) => (
              <button
                key={t.key}
                type="button"
                className="builder__chip"
                aria-pressed={active[t.key]}
                onClick={() => toggle(t.key)}
              >
                <span className="builder__chip-dot" data-on={active[t.key]} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="builder__stage" aria-hidden="true">
          <div className="builder__glow" />
          <div className="builder__stack">
            {[...burgerLayers].reverse().map((layer) => (
              <div
                key={layer.id}
                className={`builder__layer builder__layer--${layer.id.replace(/-\d$/, "")}`}
                data-active={isLayerActive(layer.id)}
                style={{ background: `linear-gradient(160deg, ${layer.accent}, ${layer.color})` }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
