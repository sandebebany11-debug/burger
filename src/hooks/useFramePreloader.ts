import { useEffect, useRef, useState } from "react";

export type FrameLoadStatus = "idle" | "loading" | "ready" | "unavailable";

export type FramePreloadResult = {
  images: HTMLImageElement[] | null;
  status: FrameLoadStatus;
};

/**
 * Preloads a numbered sequence of frame images for ScrollStage, e.g.
 *   /assets/frames/frame_0001.webp ... frame_0180.webp
 *
 * Drop real photography into public/assets/frames using this naming scheme
 * and pass basePath + count to ScrollStage to switch from the procedural
 * fallback renderer to real scrub-through photography — no other code
 * changes required.
 *
 * Fails fast: if the first frame 404s, we assume the set isn't present yet
 * and report "unavailable" immediately instead of firing hundreds of
 * doomed requests.
 */
export function useFramePreloader(
  basePath: string | null,
  count: number,
  options?: { pad?: number; ext?: string },
): FramePreloadResult {
  const pad = options?.pad ?? 4;
  const ext = options?.ext ?? "webp";
  const [result, setResult] = useState<FramePreloadResult>({ images: null, status: "idle" });
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    if (!basePath || count <= 0) {
      setResult({ images: null, status: "unavailable" });
      return;
    }

    setResult({ images: null, status: "loading" });

    const frameUrl = (i: number) => `${basePath}/frame_${String(i).padStart(pad, "0")}.${ext}`;

    const probe = new Image();
    probe.onload = () => {
      if (cancelledRef.current) return;
      const images: HTMLImageElement[] = new Array(count);
      let loaded = 0;
      let failed = false;

      images[0] = probe;
      loaded++;

      for (let i = 2; i <= count; i++) {
        const img = new Image();
        img.onload = () => {
          if (cancelledRef.current || failed) return;
          images[i - 1] = img;
          loaded++;
          if (loaded === count) setResult({ images, status: "ready" });
        };
        img.onerror = () => {
          if (cancelledRef.current || failed) return;
          failed = true;
          setResult({ images: null, status: "unavailable" });
        };
        img.src = frameUrl(i);
      }

      if (count === 1) setResult({ images, status: "ready" });
    };
    probe.onerror = () => {
      if (cancelledRef.current) return;
      setResult({ images: null, status: "unavailable" });
    };
    probe.src = frameUrl(1);

    return () => {
      cancelledRef.current = true;
    };
  }, [basePath, count, pad, ext]);

  return result;
}
