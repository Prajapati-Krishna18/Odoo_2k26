/**
 * @file    auth.middleware.ts
 * @desc    Authentication and authorization middleware.
 *
 *          authenticate  — Verifies the JWT access token from the Authorization
 *                          header and attaches the decoded payload to `req.user`.
 *
 *          authorize     — Higher-order middleware that restricts access to
 *                          users whose role is in the supplied allow-list.
 */

import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

// ────────────────────────────────────────────────────────────
// authenticate
// ────────────────────────────────────────────────────────────

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Access token is missing");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw ApiError.unauthorized("Access token is missing");
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      next(ApiError.unauthorized("Access token has expired"));
      return;
    }
    if (error instanceof JsonWebTokenError) {
      next(ApiError.unauthorized("Invalid access token"));
      return;
    }
    next(error);
  }
};

// ────────────────────────────────────────────────────────────
// authorize
// ────────────────────────────────────────────────────────────

/**
 * Restrict access to users whose role is in the provided allow-list.
 *
 * @example
 * router.get("/admin-only", authenticate, authorize("ADMIN"), handler);
 * router.get("/managers", authenticate, authorize("ADMIN", "ASSET_MANAGER"), handler);
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized("Authentication required"));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        ApiError.forbidden(
          "You do not have permission to perform this action"
        )
      );
      return;
    }

    next();
  };
};
