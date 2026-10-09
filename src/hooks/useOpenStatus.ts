import { useSyncExternalStore } from "react";
import { getOpenStatus, type OpenStatus } from "../lib/hours";

let cached: OpenStatus | null = null;

function getSnapshot(): OpenStatus {
  const next = getOpenStatus();
  if (!cached || cached.label !== next.label || cached.today !== next.today) cached = next;
  return cached;
}

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 30_000);
  return () => window.clearInterval(id);
}

/** Live open/closed status; `null` during prerender so the HTML stays time-independent. */
export function useOpenStatus(): OpenStatus | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
