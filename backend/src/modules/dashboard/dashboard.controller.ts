/**
 * @file    dashboard.controller.ts
 * @desc    HTTP request handlers for Dashboard routes.
 */

import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import * as dashboardService from "./dashboard.service.js";

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  const stats = await dashboardService.getDashboardStats();
  const response = ApiResponse.ok("Dashboard statistics retrieved successfully", stats);
  res.status(response.statusCode).json(response);
};
