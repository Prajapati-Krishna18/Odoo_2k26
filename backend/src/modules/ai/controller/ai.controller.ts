/**
 * @file    ai.controller.ts
 * @desc    HTTP request handlers for AI Assistant.
 */

import type { Request, Response } from "express";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { AIService } from "../service/ai.service.js";
import { chatRequestSchema, sanitizeInput } from "../validator/ai.validator.js";

export const chat = async (req: Request, res: Response): Promise<void> => {
  // 1. Validate request body
  const parsed = chatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw ApiError.badRequest("Validation failed", errors);
  }

  // 2. Sanitize query input for prompt injection protection
  const cleanMessage = sanitizeInput(parsed.data.message);
  if (!cleanMessage || cleanMessage === "[injection blocked]") {
    throw ApiError.badRequest("Message was blocked due to safety and prompt integrity guidelines.");
  }

  try {
    // 3. Process chat query
    const result = await AIService.chat(cleanMessage);

    // 4. Return formatted response
    const response = ApiResponse.ok("AI response generated successfully", {
      answer: result.answer,
      intent: result.intent,
      confidence: result.confidence,
    });

    res.status(response.statusCode).json(response);
  } catch (err: any) {
    console.error("❌  Error in AI Controller chat handler:", err);

    // Differentiate Gemini specific failures for the frontend
    if (err.status === 403 || err.message?.includes("API key")) {
      throw new ApiError(503, "AI service is currently unavailable: Invalid API configuration.");
    }

    if (err.status === 429 || err.message?.includes("Quota")) {
      throw new ApiError(429, "AI service rate limit exceeded. Please try again in a few moments.");
    }

    // Default error fallback (forwarded to error middleware)
    throw err;
  }
};
