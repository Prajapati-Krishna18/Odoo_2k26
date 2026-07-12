/**
 * @file    requestLogger.middleware.ts
 * @desc    Custom request logger that logs method, URL, status, and duration.
 *          Complements Morgan by providing structured, timestamp-prefixed output
 *          suitable for application-level debugging.
 */

import type { Request, Response, NextFunction } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();

    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`
    );
  });

  next();
};
