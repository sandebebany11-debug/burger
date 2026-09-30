import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { images, type ImageName } from "../data/images.gen";
import { gsap, isFinePointer, prefersReducedMotion, scrollToHash } from "../lib/motion";
import { site } from "../lib/paths";

// ------------------------------------------------------------------ Picture

type PictureProps = {
  name: ImageName;
  alt: string;
  /** CSS sizes attribute — how wide the image renders */
  sizes: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  focus?: string;
};

/** Responsive AVIF/WebP/JPEG picture with a blurred inline placeholder. */
export function Picture({ name, alt, sizes, className, imgClassName, priority, focus }: PictureProps) {
  const img = images[name];
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  const base = site(img.src);
  const set = (ext: string) => img.widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(", ");
  const fallback = `${base}-${img.widths[Math.min(1, img.widths.length - 1)]}.jpg`;

  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);

  return (
    <div className={`pic ${loaded ? "is-loaded" : ""} ${className ?? ""}`}>
      <img className="pic__lqip" src={img.lqip} alt="" aria-hidden="true" />
      <picture>
        <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
        <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
        <img
          ref={ref}
          className={imgClassName}
          src={fallback}
          srcSet={set("jpg")}
          sizes={sizes}
          width={img.width}
          height={img.height}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          style={{ objectPosition: focus ?? img.focus }}
          onLoad={() => setLoaded(true)}
        />
      </picture>
    </div>
  );
}

// ------------------------------------------------------------------ Arrow

export function Arrow() {
  const path = <path d="M1 9h15M10 3l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" />;
  return (
    <span className="btn__arrow" aria-hidden="true">
      <svg viewBox="0 0 18 18">{path}</svg>
      <svg viewBox="0 0 18 18">{path}</svg>
    </span>
  );
}

// ------------------------------------------------------------------ Button

type ButtonProps = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "dark" | "light" | "gold" | "ghost";
  small?: boolean;
  arrow?: boolean;
  className?: string;
  cursor?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  external?: boolean;
};

/** Pill button with sliding fill, arrow swap and a magnetic pull on desktop. */
export function Button({
  href,
  onClick,
  children,
  variant = "dark",
  small,
  arrow = true,
  className = "",
  cursor,
  type = "button",
  disabled,
  external,
}: ButtonProps) {
  const ref = useRef<HTMLElement>(null);
  useMagnetic(ref);
  const cls = `btn ${variant !== "dark" ? `btn--${variant}` : ""} ${small ? "btn--small" : ""} ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      {arrow && <Arrow />}
    </>
  );
  if (href) {
    const internal = href.startsWith("#");
    return (
      <a
        ref={ref as RefObject<HTMLAnchorElement>}
        className={cls}
        href={href}
        data-cursor={cursor}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        onClick={(e) => {
          if (internal) {
            e.preventDefault();
            scrollToHash(href);
          }
          onClick?.();
        }}
      >
        {inner}
      </a>
    );
  }
  return (
    <button
      ref={ref as RefObject<HTMLButtonElement>}
      className={cls}
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-cursor={cursor}
    >
      {inner}
    </button>
  );
}

export function useMagnetic(ref: RefObject<HTMLElement | null>, strength = 0.28) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !isFinePointer() || prefersReducedMotion()) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [ref, strength]);
}

// ------------------------------------------------------------------ Split text

/** Renders text as masked words (`.sw > span`) for staggered reveals. */
export function Words({ text, className }: { text: string; className?: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <span key={i}>
            <span className="sw">
              <span>{w}</span>
            </span>
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    </span>
  );
}

/** Each entry is one visual line, masked for a rise-in reveal. */
export function Lines({ lines, className }: { lines: ReactNode[]; className?: string }) {
  return (
    <span className={className}>
      {lines.map((l, i) => (
        <span key={i} className="line-mask">
          <span>{l}</span>
        </span>
      ))}
    </span>
  );
}

// ------------------------------------------------------------------ hooks

/** gsap.context bound to a scope element, reverted on unmount. */
export function useGsap(
  scope: RefObject<HTMLElement | null>,
  setup: (ctx: { reduced: boolean; q: (sel: string) => HTMLElement[] }) => void,
  deps: unknown[] = [],
) {
  useLayoutEffect(() => {
    if (!scope.current) return;
    const reduced = prefersReducedMotion();
    const el = scope.current;
    const ctx = gsap.context(() => setup({ reduced, q: (s) => gsap.utils.toArray<HTMLElement>(s, el) }), el);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Standard reveal for section headings and copy blocks. */
export function revealOnScroll(targets: HTMLElement[], trigger: HTMLElement, opts: gsap.TweenVars = {}) {
  if (!targets.length) return;
  gsap.from(targets, {
    yPercent: 110,
    duration: 1.3,
    ease: "expo.out",
    stagger: 0.08,
    ...opts,
    scrollTrigger: { trigger, start: "top 82%", once: true },
  });
}
