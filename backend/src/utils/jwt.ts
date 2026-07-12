/**
 * @file    jwt.ts
 * @desc    JWT token generation and verification utilities.
 *          Supports separate secrets and expiry for access and refresh tokens.
 */

import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

// ────────────────────────────────────────────────────────────
// Payload shape embedded in every token
// ────────────────────────────────────────────────────────────

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

// ────────────────────────────────────────────────────────────
// Token generation
// ────────────────────────────────────────────────────────────

export function generateAccessToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

export function generateRefreshToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
}

// ────────────────────────────────────────────────────────────
// Token verification
// ────────────────────────────────────────────────────────────

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
}
