/**
 * @file    error.middleware.ts
 * @desc    Global Express error handler.
 *
 *          Catches ApiError instances and unknown errors alike,
 *          returning a uniform JSON shape to the client.
 *
 *          In development, the full stack trace is included.
 */

import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // If it's our custom ApiError, use its status code and message.
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      ...(env.isDevelopment && { stack: err.stack }),
    });
    return;
  }

  // Unknown / unexpected error
  console.error("⚠️  Unhandled Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    ...(env.isDevelopment && { stack: err.stack }),
  });
};
