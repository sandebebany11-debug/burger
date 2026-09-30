import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";

/**
 * Serves /api/* during `npm run dev` / `npm run preview` with the same handler
 * the Netlify Function uses, backed by a local JSON store in .data/.
 */
function localApi(): Plugin {
  const attach = (server: { middlewares: { use: Function }; ssrLoadModule?: Function }, load: () => Promise<{ handle: (r: Request) => Promise<Response> }>) => {
    process.env.RESERVATION_STORE ??= "file";
    process.env.ADMIN_PASSWORD ??= "casa-ducale-dev";
    server.middlewares.use(async (req: any, res: any, next: () => void) => {
      if (!req.url?.startsWith("/api/")) return next();
      const chunks: Buffer[] = [];
      for await (const c of req) chunks.push(c);
      const body = chunks.length ? Buffer.concat(chunks) : undefined;
      const request = new Request(`http://localhost${req.url}`, {
        method: req.method,
        headers: req.headers as Record<string, string>,
        body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
      });
      const { handle } = await load();
      const response = await handle(request);
      res.statusCode = response.status;
      response.headers.forEach((v, k) => res.setHeader(k, v));
      res.end(Buffer.from(await response.arrayBuffer()));
    });
  };
  return {
    name: "casa-ducale-local-api",
    configureServer(server) {
      attach(server, () => server.ssrLoadModule("/server/api.ts") as never);
    },
    configurePreviewServer(server) {
      attach(server, () => import("./server/api.ts") as never);
    },
  };
}

export default defineConfig({
  plugins: [react(), localApi()],
  build: {
    target: "es2020",
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        admin: resolve(import.meta.dirname, "admin/index.html"),
        impressum: resolve(import.meta.dirname, "impressum/index.html"),
        datenschutz: resolve(import.meta.dirname, "datenschutz/index.html"),
      },
    },
  },
});
