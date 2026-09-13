import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import BurgerExplosion from "./components/BurgerExplosion";
import BurgerShowcase from "./components/BurgerShowcase";
import BurgerBuilder from "./components/BurgerBuilder";
import QualitySection from "./components/QualitySection";
import IngredientScroll from "./components/IngredientScroll";
import ReasonsSection from "./components/ReasonsSection";
import StorySection from "./components/StorySection";
import NameSection from "./components/NameSection";
import OpeningHours from "./components/OpeningHours";
import ContactSection from "./components/ContactSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <a href="#main" className="skip-link">
        Zum Inhalt springen
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <BurgerExplosion />
        <BurgerShowcase />
        <BurgerBuilder />
        <QualitySection />
        <IngredientScroll />
        <ReasonsSection />
        <StorySection />
        <NameSection />
        <OpeningHours />
        <ContactSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

export default App;
