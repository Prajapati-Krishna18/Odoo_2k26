/**
 * @file    notFound.middleware.ts
 * @desc    Catches requests that don't match any registered route
 *          and returns a 404 JSON response.
 */

import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";

export const notFoundMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};
