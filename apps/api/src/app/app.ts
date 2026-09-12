import cors from "cors";
import express from "express";
import { env } from "../config/env";
import { errorHandler } from "../shared/middleware/errorHandler";
import { routes } from "./routes";

export function createApp() {
  const app = express();

  // CORS is a browser-only concern: the mobile app's native HTTP calls carry no Origin
  // header and are never subject to this check, so only the web app's URL needs listing.
  app.use(cors({ origin: env.WEB_URL ? [env.WEB_URL] : true }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok" } });
  });

  app.use("/api/v1", routes);

  app.use(errorHandler);

  return app;
}
