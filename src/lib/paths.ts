// Site root, derived from where the built bundle lives (assets/*.js → "../"),
// so the site works at a domain root and under any sub-path alike.
export const ROOT = import.meta.env.DEV ? "/" : new URL("../", import.meta.url).href;

/** Absolute URL for a file or route relative to the site root. */
export const site = (path: string) => ROOT + path.replace(/^\//, "");
