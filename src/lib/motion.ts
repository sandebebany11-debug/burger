import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: "power3.out", duration: 1 });
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };

export const EASE = {
  out: "expo.out",
  inOut: "expo.inOut",
  soft: "power3.out",
};

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isFinePointer(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

let lenis: Lenis | null = null;

/** Smooth scrolling (desktop only; native touch scrolling stays untouched). */
export function initSmoothScroll(): Lenis | null {
  if (lenis || prefersReducedMotion()) return lenis;
  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function getLenis(): Lenis | null {
  return lenis;
}

export function stopScroll(stop: boolean): void {
  if (lenis) {
    if (stop) lenis.stop();
    else lenis.start();
  }
  document.documentElement.style.overflow = stop ? "hidden" : "";
}

/** Scrolls to an in-page anchor, respecting the fixed header. */
export function scrollToHash(hash: string): void {
  const el = document.querySelector<HTMLElement>(hash);
  if (!el) return;
  const offset = hash === "#top" ? 0 : -8;
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.6 });
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  // move focus for keyboard / screen-reader users
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}
