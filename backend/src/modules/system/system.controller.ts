/**
 * @file    system.controller.ts
 * @desc    HTTP request handlers for system diagnostics and version information.
 */

import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { SystemHealthService, VersionService } from "./system.service.js";

export const getHealth = async (_req: Request, res: Response): Promise<void> => {
  const health = await SystemHealthService.getHealthCheck();
  const response = ApiResponse.ok("System health diagnostics retrieved", health);
  res.status(response.statusCode).json(response);
};

export const getInfo = async (_req: Request, res: Response): Promise<void> => {
  const info = SystemHealthService.getSystemInfo();
  const response = ApiResponse.ok("System information retrieved", info);
  res.status(response.statusCode).json(response);
};

export const getVersion = async (_req: Request, res: Response): Promise<void> => {
  const version = VersionService.getVersionInfo();
  const response = ApiResponse.ok("System version retrieved", version);
  res.status(response.statusCode).json(response);
};
