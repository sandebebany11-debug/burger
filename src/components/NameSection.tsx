import { nameOrigin } from "../data/content";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";
import "./NameSection.css";

export default function NameSection() {
  const ref = useRevealOnScroll<HTMLDivElement>();

  return (
    <section className="name-origin" aria-labelledby="name-heading">
      <div ref={ref} className="container name-origin__inner reveal-up">
        <h2 id="name-heading" className="name-origin__headline">
          {nameOrigin.heading}
        </h2>
        <p className="name-origin__text">{nameOrigin.text}</p>
        <div className="name-origin__words">
          <span>Vollkommenheit</span>
          <span>Vollständigkeit</span>
          <span>Fülle</span>
        </div>
      </div>
    </section>
  );
}
