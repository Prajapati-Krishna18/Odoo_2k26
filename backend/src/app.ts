/**
 * @file    app.ts
 * @desc    Express application factory.
 *
 *          Configures all global middleware, mounts the API router,
 *          and registers the 404 + global error handlers.
 *
 *          The app instance is exported so that server.ts can
 *          start listening on it independently.
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { corsOptions } from "./config/cors.js";
import { morganFormat } from "./config/logger.js";
import { requestLogger } from "./middleware/requestLogger.middleware.js";
import { notFoundMiddleware } from "./middleware/notFound.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import apiRouter from "./routes/index.js";
import { ApiResponse } from "./utils/ApiResponse.js";
import {
  API_PREFIX,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
} from "./constants/app.js";

// ────────────────────────────────────────────────────────────
// Create Express app
// ────────────────────────────────────────────────────────────

const app = express();

// ────────────────────────────────────────────────────────────
// Global Middleware
// ────────────────────────────────────────────────────────────

// Security headers
app.use(helmet());

// CORS
app.use(cors(corsOptions));

// Rate limiting
if (process.env["NODE_ENV"] !== "development") {
  app.use(
    rateLimit({
      windowMs: RATE_LIMIT_WINDOW_MS,
      max: RATE_LIMIT_MAX_REQUESTS,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many requests, please try again later.",
      },
    })
  );
}

// Body parsing
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Cookie parsing
app.use(cookieParser());

// Response compression
app.use(compression());

// HTTP request logging (Morgan)
app.use(morgan(morganFormat));

// Custom structured request logger
app.use(requestLogger);

// ────────────────────────────────────────────────────────────
// Health Check (root)
// ────────────────────────────────────────────────────────────

app.get("/", (_req, res) => {
  const response = ApiResponse.ok("AssetFlow Backend Running", null);
  res.status(response.statusCode).json(response);
});

// ────────────────────────────────────────────────────────────
// API Routes
// ────────────────────────────────────────────────────────────

app.use(API_PREFIX, apiRouter);

// ────────────────────────────────────────────────────────────
// Error Handling (must be registered AFTER routes)
// ────────────────────────────────────────────────────────────

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
