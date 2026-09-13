# Der dicke Bub — Website

Cinematic React/TypeScript website for **Der dicke Bub**, Burger-Restaurant &
Lieferservice in Leverkusen-Schlebusch.

## Stack

- React 19 + TypeScript, built with Vite
- GSAP + ScrollTrigger for the "10 besten Gründe" pinned scroll sequence
- A custom `ScrollStage` canvas engine (`src/components/ScrollStage.tsx`) for
  the scroll-scrubbed burger explosion, following the
  `frameIndex = round(scrollProgress * (totalFrames - 1))` principle
- No image or audio assets required to run — see below

## Getting started

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build
npm run preview  # preview the production build
```

## Content policy

All business facts (address, phone, opening hours, delivery times, story,
quality claims, the "10 besten Gründe") live in `src/data/content.ts` and are
sourced from the real derdickebub.de site and the owner-provided brief.
**Do not add invented prices, dishes, or claims to this file.**

## Assets

This build ships with **no photography, logo file, or audio** — none were
retrievable in the environment it was built in. Instead:

- The hero/explosion burger is rendered procedurally on `<canvas>`
  (`src/lib/burgerRenderer.ts`) using the real ingredient list, so the site
  looks intentional and works immediately.
- The logo is a typographic wordmark of the real business name, not a
  fabricated logo mark.
- Every `public/assets/*` subfolder has a short README describing exactly
  what to drop in and which component to wire it into once real photography,
  the logo file, a portrait of Shahram Rahmani, or sound design become
  available. No other code changes should be required.

## Structure

```
src/
  components/   one component per section (Hero, ScrollStage, BurgerExplosion, ...)
  data/         content.ts — the single source of truth for real content
  hooks/        useReducedMotion, useFramePreloader, useRevealOnScroll, useHorizontalWheel
  lib/          burgerRenderer.ts — procedural canvas drawing
```
