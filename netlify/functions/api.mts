import type { Config } from "@netlify/functions";
import { handle } from "../../server/api.ts";

export default (req: Request) => handle(req);

export const config: Config = {
  path: "/api/*",
};
