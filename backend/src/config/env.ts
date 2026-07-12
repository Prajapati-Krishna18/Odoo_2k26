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

  /** Convenience flag */
  isDevelopment: process.env["NODE_ENV"] === "development",
  isProduction: process.env["NODE_ENV"] === "production",
} as const;
