/**
 * @file    asyncHandler.ts
 * @desc    Wraps async Express route handlers so that rejected promises
 *          are forwarded to the global error middleware automatically.
 *
 *          Without this, every async handler would need its own try/catch.
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
