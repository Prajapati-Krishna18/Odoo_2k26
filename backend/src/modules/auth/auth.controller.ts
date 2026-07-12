/**
 * @file    auth.controller.ts
 * @desc    HTTP request handlers for authentication endpoints.
 *          Validates input via Zod, delegates to the service layer,
 *          and returns standardised ApiResponse payloads.
 */

import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import * as authService from "./auth.service.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "./auth.validator.js";

// ────────────────────────────────────────────────────────────
// POST /api/auth/register
// ────────────────────────────────────────────────────────────

export const register = async (req: Request, res: Response): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw ApiError.badRequest("Validation failed", errors);
  }

  const user = await authService.register(parsed.data);
  const response = ApiResponse.created("User registered successfully", user);
  res.status(response.statusCode).json(response);
};

// ────────────────────────────────────────────────────────────
// POST /api/auth/login
// ────────────────────────────────────────────────────────────

export const login = async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw ApiError.badRequest("Validation failed", errors);
  }

  const result = await authService.login(parsed.data);
  const response = ApiResponse.ok("Login successful", result);
  res.status(response.statusCode).json(response);
};

// ────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ────────────────────────────────────────────────────────────

export const logout = async (req: Request, res: Response): Promise<void> => {
  const parsed = refreshTokenSchema.safeParse(req.body);

  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw ApiError.badRequest("Validation failed", errors);
  }

  await authService.logout(parsed.data.refreshToken);
  const response = ApiResponse.ok("Logged out successfully", null);
  res.status(response.statusCode).json(response);
};

// ────────────────────────────────────────────────────────────
// POST /api/auth/refresh-token
// ────────────────────────────────────────────────────────────

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = refreshTokenSchema.safeParse(req.body);

  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw ApiError.badRequest("Validation failed", errors);
  }

  const result = await authService.refreshAccessToken(
    parsed.data.refreshToken
  );
  const response = ApiResponse.ok("Token refreshed successfully", result);
  res.status(response.statusCode).json(response);
};

// ────────────────────────────────────────────────────────────
// GET /api/auth/me
// ────────────────────────────────────────────────────────────

export const getMe = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required");
  }

  const user = await authService.getMe(req.user.id);
  const response = ApiResponse.ok("User profile retrieved", user);
  res.status(response.statusCode).json(response);
};
