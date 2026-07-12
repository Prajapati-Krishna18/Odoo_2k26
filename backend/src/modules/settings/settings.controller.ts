/**
 * @file    settings.controller.ts
 * @desc    HTTP request handlers for System Settings.
 */

import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import * as settingsService from "./settings.service.js";
import { z } from "zod";

const updateSettingsSchema = z.object({
  companyName: z.string().min(2).max(100).optional(),
  companyLogo: z.string().url("Invalid company logo URL").nullable().optional(),
  address: z.string().max(200).nullable().optional(),
  timezone: z.string().min(1).optional(),
  dateFormat: z.string().min(1).optional(),
  currency: z.string().min(1).optional(),
  language: z.string().min(2).max(10).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),

  // Audit configurations
  auditRetentionDays: z.number().int().min(1, "Retention days must be at least 1").optional(),
  auditLogLevel: z.enum(["DEBUG", "INFO", "WARN", "ERROR"]).optional(),
  auditEnabledModules: z.array(z.string()).optional(),
});

export const get = async (_req: Request, res: Response): Promise<void> => {
  const settings = await settingsService.getSettings();
  const response = ApiResponse.ok("System settings retrieved successfully", settings);
  res.status(response.statusCode).json(response);
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const parsed = updateSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw ApiError.badRequest("Validation failed", errors);
  }

  const settings = await settingsService.updateSettings(parsed.data);
  const response = ApiResponse.ok("System settings updated successfully", settings);
  res.status(response.statusCode).json(response);
};
