import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { tenReasons } from "../data/content";
import { useReducedMotion } from "../hooks/useReducedMotion";
import "./ReasonsSection.css";

gsap.registerPlugin(ScrollTrigger);

export default function ReasonsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (reducedMotion) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const items = itemRefs.current.filter((el): el is HTMLLIElement => Boolean(el));
      gsap.set(items, { opacity: 0, y: 50 });
      gsap.set(items[0], { opacity: 1, y: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${items.length * 380}`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
        },
      });

      items.forEach((item, i) => {
        if (i === 0) return;
        tl.to(itemRefs.current[i - 1], { opacity: 0, y: -50, duration: 0.6 }, i - 0.5)
          .to(item, { opacity: 1, y: 0, duration: 0.6 }, i - 0.5);
      });
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="gruende"
      className={`reasons${reducedMotion ? " reasons--static" : ""}`}
      aria-labelledby="reasons-heading"
    >
      <div className="reasons__frame">
        <div className="container reasons__header">
          <span className="eyebrow">Warum Der dicke Bub</span>
          <h2 id="reasons-heading" className="section-heading">
            Die 10 „B“esten Gründe
          </h2>
        </div>

        <ul className="reasons__list container">
          {tenReasons.map((reason, i) => (
            <li
              key={reason}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="reasons__item"
            >
              <span className="reasons__number">{String(i + 1).padStart(2, "0")}</span>
              <p>{reason}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
