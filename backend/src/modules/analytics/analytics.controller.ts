/**
 * @file    analytics.controller.ts
 * @desc    HTTP request handlers for Analytics endpoints.
 */

import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import * as analyticsService from "./analytics.service.js";
import { z } from "zod";

const analyticsQuerySchema = z.object({
  cycle: z.enum(["weekly", "monthly", "yearly", "custom"]).default("weekly"),
  start: z.string().datetime("Invalid start date format").optional(),
  end: z.string().datetime("Invalid end date format").optional(),
});

export const getTrends = async (req: Request, res: Response): Promise<void> => {
  const parsed = analyticsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw ApiError.badRequest("Validation failed", errors);
  }

  const trends = await analyticsService.getAnalyticsTrends(
    parsed.data.cycle,
    parsed.data.start,
    parsed.data.end
  );

  const response = ApiResponse.ok("Analytics trends compiled successfully", trends);
  res.status(response.statusCode).json(response);
};
