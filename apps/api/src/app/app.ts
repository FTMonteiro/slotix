import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { env } from "../config/env";
import { generateOpenApiDocument } from "../docs/openapi";
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

  // Generated once at startup from the same Zod schemas used for request validation
  // (see src/docs), so the docs can't drift silently out of sync with what the API
  // actually accepts.
  const openApiDocument = generateOpenApiDocument();
  app.get("/api/v1/docs.json", (_req, res) => res.json(openApiDocument));
  app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.use("/api/v1", routes);

  app.use(errorHandler);

  return app;
}
