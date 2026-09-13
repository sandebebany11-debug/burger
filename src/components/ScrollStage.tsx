import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useFramePreloader } from "../hooks/useFramePreloader";
import "./ScrollStage.css";

export type DrawArgs = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  progress: number;
  time: number;
  reducedMotion: boolean;
};

export type ScrollStageProps = {
  /** Scroll track length as a multiple of the viewport height. 4 = 400vh of scroll for a full 0→1 sweep. */
  heightVh?: number;
  /** Optional real photography sequence, e.g. "/assets/frames" -> frame_0001.webp */
  frameBasePath?: string;
  frameCount?: number;
  /** Procedural fallback (or primary) draw function: frameIndex/scrollProgress -> canvas painting. */
  renderFrame: (args: DrawArgs) => void;
  /** Called on every meaningful progress change (throttled) so DOM overlays can sync to the canvas. */
  onProgress?: (progress: number) => void;
  className?: string;
  children?: (progress: number) => ReactNode;
  ariaLabel: string;
};

/**
 * ScrollStage: scrollProgress -> frameIndex -> canvas paint.
 *
 * Core principle (see project brief):
 *   frameIndex = Math.round(scrollProgress * (totalFrames - 1))
 *
 * If frameBasePath/frameCount resolve to a real, loadable image sequence,
 * frames are drawn with cover-fit drawImage. Otherwise renderFrame runs as
 * a procedural canvas fallback so the section always looks intentional.
 */
export default function ScrollStage({
  heightVh = 400,
  frameBasePath,
  frameCount = 0,
  renderFrame,
  onProgress,
  className,
  children,
  ariaLabel,
}: ScrollStageProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = useReducedMotion();

  const { images, status } = useFramePreloader(frameBasePath ?? null, frameCount);
  const useRealFrames = status === "ready" && images && images.length === frameCount;

  const progressRef = useRef(0);
  const [overlayProgress, setOverlayProgress] = useState(0);
  const inViewRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });

  // Resize handling
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { width: rect.width, height: rect.height, dpr };
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  // Visibility gating so the rAF loop only runs near/at the section
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { rootMargin: "20% 0px 20% 0px" },
    );
    io.observe(track);
    return () => io.disconnect();
  }, []);

  // Scroll progress computation
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const computeProgress = () => {
      const rect = track.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return 0;
      const raw = -rect.top / total;
      return Math.min(1, Math.max(0, raw));
    };

    const onScroll = () => {
      progressRef.current = computeProgress();
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastReported = -1;
    const start = performance.now();

    const paintStatic = () => {
      const { width, height } = sizeRef.current;
      if (!width || !height) return;
      if (useRealFrames && images) {
        const frameIndex = 0;
        drawCoverImage(ctx, images[frameIndex], width, height);
      } else {
        renderFrame({ ctx, width, height, progress: 0, time: 0, reducedMotion: true });
      }
    };

    if (reducedMotion) {
      paintStatic();
      onProgress?.(0);
      setOverlayProgress(0);
      return;
    }

    const tick = (now: number) => {
      rafRef.current = requestAnimationFrame(tick);
      if (!inViewRef.current) return;
      const { width, height } = sizeRef.current;
      if (!width || !height) return;

      const progress = progressRef.current;
      const time = (now - start) / 1000;

      if (useRealFrames && images) {
        const frameIndex = Math.round(progress * (frameCount - 1));
        drawCoverImage(ctx, images[frameIndex], width, height);
      } else {
        renderFrame({ ctx, width, height, progress, time, reducedMotion: false });
      }

      const bucket = Math.round(progress * 400);
      if (bucket !== lastReported) {
        lastReported = bucket;
        onProgress?.(progress);
        setOverlayProgress(progress);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useRealFrames, images, frameCount, reducedMotion]);

  const trackStyle = useMemo(
    () => (reducedMotion ? undefined : { height: `${heightVh}vh` }),
    [heightVh, reducedMotion],
  );

  return (
    <div ref={trackRef} className={`scroll-stage-track${className ? ` ${className}` : ""}`} style={trackStyle}>
      <div ref={stageRef} className="scroll-stage-pin" style={reducedMotion ? { position: "relative" } : undefined}>
        <canvas ref={canvasRef} className="scroll-stage-canvas" role="img" aria-label={ariaLabel} />
        <div className="scroll-stage-overlay">{children?.(reducedMotion ? 0 : overlayProgress)}</div>
      </div>
    </div>
  );
}

function drawCoverImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);
  const imgRatio = img.width / img.height;
  const boxRatio = width / height;
  let drawW: number;
  let drawH: number;
  if (imgRatio > boxRatio) {
    drawH = height;
    drawW = height * imgRatio;
  } else {
    drawW = width;
    drawH = width / imgRatio;
  }
  const dx = (width - drawW) / 2;
  const dy = (height - drawH) / 2;
  ctx.drawImage(img, dx, dy, drawW, drawH);
}
