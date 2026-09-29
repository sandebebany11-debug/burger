import { useLayoutEffect, type RefObject } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from './motion'
import { splitWords } from './split'

/**
 * Zentrales Motion-System. Elemente werden über data-Attribute gesteuert:
 *
 *   data-reveal="text"    Wörter gleiten aus einer Maske nach oben
 *   data-reveal="fade"    sanftes Einblenden von unten
 *   data-reveal="image"   Bild wird per clip-path enthüllt, Inhalt zoomt zurück
 *   data-reveal="line"    Linie zeichnet sich von links nach rechts
 *   data-stagger          Kinder erscheinen nacheinander
 *   data-parallax="0.2"   Parallax beim Scrollen (Anteil der Höhe)
 */
export function useScrollAnimations(root: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useLayoutEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>('[data-reveal="text"]').forEach((node) => {
        const words = splitWords(node)
        gsap.from(words, {
          yPercent: 115,
          rotate: 2,
          duration: 1.3,
          stagger: 0.035,
          ease: 'expo.out',
          scrollTrigger: { trigger: node, start: 'top 88%', once: true },
        })
      })

      el.querySelectorAll<HTMLElement>('[data-reveal="fade"]').forEach((node) => {
        gsap.from(node, {
          y: 36,
          autoAlpha: 0,
          duration: 1.2,
          delay: Number(node.dataset.delay ?? 0),
          scrollTrigger: { trigger: node, start: 'top 90%', once: true },
        })
      })

      el.querySelectorAll<HTMLElement>('[data-reveal="image"]').forEach((node) => {
        const inner = node.querySelector('picture, img')
        const tl = gsap.timeline({ scrollTrigger: { trigger: node, start: 'top 85%', once: true } })
        tl.fromTo(
          node,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' },
        )
        if (inner) tl.from(inner, { scale: 1.35, duration: 2, ease: 'expo.out' }, 0.15)
      })

      el.querySelectorAll<HTMLElement>('[data-reveal="line"]').forEach((node) => {
        gsap.from(node, {
          scaleX: 0,
          transformOrigin: 'left center',
          duration: 1.6,
          ease: 'expo.inOut',
          scrollTrigger: { trigger: node, start: 'top 92%', once: true },
        })
      })

      el.querySelectorAll<HTMLElement>('[data-stagger]').forEach((node) => {
        gsap.from(node.children, {
          y: 40,
          autoAlpha: 0,
          duration: 1.1,
          stagger: 0.08,
          scrollTrigger: { trigger: node, start: 'top 88%', once: true },
        })
      })

      el.querySelectorAll<HTMLElement>('[data-parallax]').forEach((node) => {
        const amount = Number(node.dataset.parallax) || 0.15
        gsap.fromTo(
          node,
          { yPercent: -amount * 50 },
          {
            yPercent: amount * 50,
            ease: 'none',
            scrollTrigger: { trigger: node.parentElement ?? node, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })
    }, el)

    // Nach dem Laden von Schriften/Bildern Positionen neu berechnen
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => {
      window.removeEventListener('load', refresh)
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
