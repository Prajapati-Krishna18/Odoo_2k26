/**
 * @file    auth.validator.ts
 * @desc    Zod validation schemas for authentication endpoints.
 *
 *          Password rules:
 *          - Minimum 8 characters
 *          - At least one uppercase letter
 *          - At least one lowercase letter
 *          - At least one digit
 *          - At least one special character
 */

import { z } from "zod";

// ── Password regex ───────────────────────────────────────────

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

// ── Register ─────────────────────────────────────────────────

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters")
    .trim(),
  email: z.string().email("Invalid email address").trim().toLowerCase(),
  password: passwordSchema,
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .max(15, "Phone number must be at most 15 characters")
    .trim(),
});

// ── Login ────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

// ── Refresh Token ────────────────────────────────────────────

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
