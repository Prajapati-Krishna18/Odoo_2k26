/**
 * @file    env.ts
 * @desc    Environment variable validation and export.
 *          Fails fast at startup if any required variable is missing.
 */

import dotenv from "dotenv";
import path from "node:path";

// Load .env from the project root (one level above src/)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// ────────────────────────────────────────────────────────────
// Required variables
// ────────────────────────────────────────────────────────────

const REQUIRED_ENV_VARS = [
  "PORT",
  "DATABASE_URL",
  "DIRECT_URL",
  "NODE_ENV",
  "CLIENT_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "JWT_ACCESS_EXPIRES",
  "JWT_REFRESH_EXPIRES",
  "GEMINI_API_KEY",
] as const;

const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `\n❌  Missing required environment variables:\n   ${missing.join("\n   ")}\n`
  );
  process.exit(1);
}

// ────────────────────────────────────────────────────────────
// Typed exports
// ────────────────────────────────────────────────────────────

export const env = {
  PORT: parseInt(process.env["PORT"]!, 10),
  DATABASE_URL: process.env["DATABASE_URL"]!,
  DIRECT_URL: process.env["DIRECT_URL"]!,
  NODE_ENV: process.env["NODE_ENV"] as "development" | "production" | "test",
  CLIENT_URL: process.env["CLIENT_URL"]!,

  // JWT
  JWT_ACCESS_SECRET: process.env["JWT_ACCESS_SECRET"]!,
  JWT_REFRESH_SECRET: process.env["JWT_REFRESH_SECRET"]!,
  JWT_ACCESS_EXPIRES: process.env["JWT_ACCESS_EXPIRES"]!,
  JWT_REFRESH_EXPIRES: process.env["JWT_REFRESH_EXPIRES"]!,

  // Gemini
  GEMINI_API_KEY: process.env["GEMINI_API_KEY"]!,

  /** Convenience flags */
  isDevelopment: process.env["NODE_ENV"] === "development",
  isProduction: process.env["NODE_ENV"] === "production",
} as const;
