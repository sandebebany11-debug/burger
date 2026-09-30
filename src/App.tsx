import { useEffect } from "react";
import Atmosphere from "./components/Atmosphere";
import { Cursor, StickyCta } from "./components/Chrome";
import Events from "./components/Events";
import Footer from "./components/Footer";
import Gallery from "./components/Gallery";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Kitchen from "./components/Kitchen";
import Marchio from "./components/Marchio";
import Menu from "./components/Menu";
import Reservation from "./components/Reservation";
import Story from "./components/Story";
import Visit from "./components/Visit";
import { initSmoothScroll, ScrollTrigger, scrollToHash } from "./lib/motion";

export default function App() {
  useEffect(() => {
    initSmoothScroll();
    // late-loading fonts and images change layout: recalc pinned sections
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    // deep links like /#reservieren
    if (location.hash.length > 1) setTimeout(() => scrollToHash(location.hash), 400);
  }, []);

  return (
    <>
      <a href="#main" className="skip-link">
        Zum Inhalt springen
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Story />
        <Marchio />
        <Kitchen />
        <Menu />
        <Atmosphere />
        <Events />
        <Gallery />
        <Reservation />
        <Visit />
      </main>
      <Footer />
      <StickyCta />
      <Cursor />
    </>
  );
}
