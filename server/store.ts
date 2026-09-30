// Persistence for reservations, settings and slot blocks.
//
// Production: Netlify Blobs (strong consistency).
// Local dev / tests: JSON files in .data/ (set RESERVATION_STORE=file).
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { getStore } from "@netlify/blobs";

export interface KV {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
}

function blobsKV(): KV {
  const store = getStore({ name: "casa-ducale", consistency: "strong" });
  return {
    async get<T>(key: string) {
      return ((await store.get(key, { type: "json" })) as T | null) ?? null;
    },
    async set(key, value) {
      await store.setJSON(key, value);
    },
    async delete(key) {
      await store.delete(key);
    },
    async list(prefix) {
      const { blobs } = await store.list({ prefix });
      return blobs.map((b) => b.key);
    },
  };
}

function fileKV(dir: string): KV {
  const file = (key: string) => path.join(dir, `${encodeURIComponent(key)}.json`);
  return {
    async get<T>(key: string) {
      try {
        return JSON.parse(await readFile(file(key), "utf8")) as T;
      } catch {
        return null;
      }
    },
    async set(key, value) {
      await mkdir(dir, { recursive: true });
      await writeFile(file(key), JSON.stringify(value, null, 2));
    },
    async delete(key) {
      await rm(file(key), { force: true });
    },
    async list(prefix) {
      try {
        return (await readdir(dir))
          .map((f) => decodeURIComponent(f.replace(/\.json$/, "")))
          .filter((k) => k.startsWith(prefix));
      } catch {
        return [];
      }
    },
  };
}

let kv: KV | undefined;
export function store(): KV {
  if (!kv) {
    kv =
      process.env.RESERVATION_STORE === "file"
        ? fileKV(process.env.RESERVATION_STORE_DIR ?? path.resolve(".data"))
        : blobsKV();
  }
  return kv;
}
