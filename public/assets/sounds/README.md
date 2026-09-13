# Sound design (optional)

No sound files were available at build time, so the site ships fully
functional without audio, per the project brief. To add sound:

1. Drop short `.mp3`/`.ogg` cues here (e.g. `sizzle.mp3`, `dock.mp3`, `whoosh.mp3`).
2. Build a small sound engine that only starts audio after a user gesture
   (browser autoplay policies) and add a visible SOUND ON/OFF control.
3. Trigger cues from `ScrollStage`'s `onProgress` callback in
   `BurgerExplosion.tsx` at specific progress thresholds.

Do not wire up a sound toggle button until real audio assets exist — a
control with nothing to control is worse than no control.
