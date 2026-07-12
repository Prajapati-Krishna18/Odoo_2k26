/**
 * @file    ai.validator.ts
 * @desc    Request validation and input sanitization to prevent prompt injection.
 */

import { z } from "zod";

export const chatRequestSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(500, "Message is too long (max 500 characters)"),
});

/**
 * Sanitize input to mitigate prompt injection risks.
 * Strips keywords related to system overrides, roleplays, and context resets.
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";

  let clean = input;

  // 1. Regular expression patterns for common prompt injection/override strings
  const injectionPatterns = [
    /ignore\s+(all\s+)?(previous\s+)?instructions/gi,
    /system\s+override/gi,
    /you\s+are\s+now/gi,
    /act\s+as\s+a/gi,
    /forget\s+(what\s+)?(I\s+)?said/gi,
    /translate\s+this/gi,
    /bypass/gi,
  ];

  for (const pattern of injectionPatterns) {
    clean = clean.replace(pattern, "[injection blocked]");
  }

  // 2. Strip basic HTML tags if any to prevent styling injection
  clean = clean.replace(/<[^>]*>/g, "");

  return clean.trim();
}
