import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler.js";
import { apiLimiter } from "./middlewares/rate-limit.js";
import { webhook } from "./modules/payments/payment.controller.js";
import { routes } from "./routes.js";

export function createApp() {
  const app = express();

  // Correct req.ip behind Render/Railway/Vercel proxies (used for rate limits + session info).
  app.set("trust proxy", env.TRUST_PROXY);
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(
    cors({
      origin: env.WEB_URL, // only the storefront may call the API from a browser
      credentials: true, // allow the session cookie
    }),
  );

  // Paystack webhook needs the RAW body for signature checks, so register it before express.json().
  app.post("/api/payments/webhook", express.raw({ type: "application/json", limit: "1mb" }), webhook);

  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.use("/api", apiLimiter, routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
