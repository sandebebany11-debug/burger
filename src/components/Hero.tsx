import { useEffect, useRef } from "react";
import { renderBurger } from "../lib/burgerRenderer";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { brand, contact } from "../data/content";
import "./Hero.css";

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();
  const scrollYRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const start = performance.now();
    const sizeRef = { width: 0, height: 0 };

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.width = rect.width;
      sizeRef.height = rect.height;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    const onScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    if (reducedMotion) {
      renderBurger(ctx, {
        width: sizeRef.width,
        height: sizeRef.height,
        progress: 0,
        time: 0,
        idleStrength: 0,
        reducedMotion: true,
      });
      return () => {
        ro.disconnect();
        window.removeEventListener("scroll", onScroll);
      };
    }

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const time = (now - start) / 1000;
      const vh = window.innerHeight || 1;
      const exitProgress = Math.min(1, Math.max(0, scrollYRef.current / vh));
      renderBurger(ctx, {
        width: sizeRef.width,
        height: sizeRef.height,
        progress: exitProgress * 0.22,
        time,
        idleStrength: 1 - exitProgress * 0.6,
        reducedMotion: false,
      });
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [reducedMotion]);

  return (
    <section id="top" className="hero" aria-label="Startbereich">
      <div ref={stageRef} className="hero__stage">
        <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />
      </div>
      <div className="hero__vignette" aria-hidden="true" />
      <div className="hero__content container">
        <span className="hero__logo hero__reveal hero__reveal--1">{brand.name}</span>
        <h1 className="hero__headline hero__reveal hero__reveal--2">
          Wir kreieren <em>Burger</em> mit Leidenschaft!
        </h1>
        <p className="hero__sub hero__reveal hero__reveal--3">
          Restaurant &amp; Lieferservice in {brand.city}
        </p>
        <div className="hero__cta hero__reveal hero__reveal--4">
          <a className="btn" href={contact.shopUrl} target="_blank" rel="noopener noreferrer">
            Online bestellen
          </a>
          <a className="btn btn-ghost" href="#burger">
            Unsere Burger entdecken
          </a>
        </div>
      </div>
      <div className="hero__scroll-hint hero__reveal hero__reveal--5" aria-hidden="true">
        <span />
        Scrollen
      </div>
    </section>
  );
}
