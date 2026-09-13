import { useEffect, useRef, type RefObject } from "react";
import { useReducedMotion } from "./useReducedMotion";

/** Adds an `is-visible` class the first time the element enters the viewport. */
export function useRevealOnScroll<T extends HTMLElement>(threshold = 0.2): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion) {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          io.unobserve(el);
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reducedMotion, threshold]);

  return ref;
}
