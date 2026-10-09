import { useEffect } from "react";

/**
 * One shared IntersectionObserver for every `[data-reveal]` element.
 * Elements get `is-visible` once and are then unobserved. The hiding styles only
 * apply under `html.js`, which index.html sets before first paint.
 */
export function useReveal() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
