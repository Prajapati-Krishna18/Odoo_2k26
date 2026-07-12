/**
 * @file    activity.controller.ts
 * @desc    HTTP request handlers for Activity Log administrative routes.
 */

import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import * as activityService from "./activity.service.js";
import { z } from "zod";

const activityQuerySchema = z.object({
  page: z.preprocess((val) => parseInt(val as string, 10), z.number().int().min(1).default(1)),
  limit: z.preprocess((val) => parseInt(val as string, 10), z.number().int().min(1).max(100).default(10)),
  userId: z.string().uuid("Invalid user ID").optional(),
  module: z.string().optional(),
  action: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"] as const).default("desc"),
});

export const list = async (req: Request, res: Response): Promise<void> => {
  const parsed = activityQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw ApiError.badRequest("Validation failed", errors);
  }

  const result = await activityService.listActivities(parsed.data);
  const response = ApiResponse.ok("Activity logs retrieved successfully", result);
  res.status(response.statusCode).json(response);
};
