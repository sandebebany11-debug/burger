# ScrollStage frame sequence

Drop a real photographed/rendered scroll-scrub sequence here, named:

```
frame_0001.webp
frame_0002.webp
...
frame_0180.webp
```

Then pass `frameBasePath="/assets/frames"` and `frameCount={180}` to the
`<ScrollStage>` instance in `src/components/BurgerExplosion.tsx`. The engine
(`src/hooks/useFramePreloader.ts`) will preload and use the real photos
automatically; until then it falls back to the procedural canvas renderer in
`src/lib/burgerRenderer.ts`, so the site always works.

150–200 frames covering: assembled burger → camera drift → layers
separating → full explosion is the target sequence described in the project
brief.
