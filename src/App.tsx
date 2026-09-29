import { useCallback, useEffect, useRef, useState } from 'react'
import { Cursor } from './components/Cursor'
import { Footer } from './components/Footer'
import { Intro } from './components/Intro'
import { MobileCta } from './components/MobileCta'
import { Nav } from './components/Nav'
import { initSmoothScroll, ScrollTrigger } from './lib/motion'
import { useScrollAnimations } from './lib/useScrollAnimations'
import { Booking } from './sections/Booking'
import { Color } from './sections/Color'
import { Gallery } from './sections/Gallery'
import { Hero } from './sections/Hero'
import { KevinMurphy } from './sections/KevinMurphy'
import { Prices } from './sections/Prices'
import { Salon } from './sections/Salon'
import { Services } from './sections/Services'
import { Team } from './sections/Team'
import { Visit } from './sections/Visit'

export function App() {
  const main = useRef<HTMLElement>(null)
  const [heroStart, setHeroStart] = useState(false)
  const [introDone, setIntroDone] = useState(false)

  useScrollAnimations(main)

  useEffect(() => {
    initSmoothScroll()
  }, [])

  // Nach dem Intro: Positionen neu berechnen und ggf. zum Anker springen
  useEffect(() => {
    if (!introDone) return
    ScrollTrigger.refresh()
    if (location.hash.length > 1) {
      document.querySelector(location.hash)?.scrollIntoView()
    }
  }, [introDone])

  const onReveal = useCallback(() => setHeroStart(true), [])
  const onDone = useCallback(() => setIntroDone(true), [])

  return (
    <>
      <a href="#main" className="skip-link">
        Zum Inhalt springen
      </a>
      {!introDone && <Intro onReveal={onReveal} onDone={onDone} />}
      <Cursor />
      <Nav />
      <main id="main" ref={main}>
        <Hero start={heroStart} />
        <Salon />
        <Services />
        <Color />
        <Gallery />
        <KevinMurphy />
        <Team />
        <Prices />
        <Booking />
        <Visit />
      </main>
      <Footer />
      <MobileCta />
    </>
  )
}
