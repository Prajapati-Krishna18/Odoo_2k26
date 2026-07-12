/**
 * @file    report.controller.ts
 * @desc    HTTP request handlers for Report and Export endpoints.
 */

import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import * as reportService from "./report.service.js";
import { ExportService } from "./export.service.js";
import { prisma } from "../../config/prisma.js";

// ── Controller Handlers ──────────────────────────────────────

export const getSummary = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required");
  }

  const summary = await reportService.getSummaryStats(req.user.id);
  const response = ApiResponse.ok("Report summary stats retrieved successfully", summary);
  res.status(response.statusCode).json(response);
};

export const listProviders = async (_req: Request, res: Response): Promise<void> => {
  const providers = reportService.getRegisteredReportProviders();
  const response = ApiResponse.ok("Registered report providers retrieved", providers);
  res.status(response.statusCode).json(response);
};

export const runCustomReport = async (req: Request, res: Response): Promise<void> => {
  const providerName = req.params["providerName"] as string;
  if (!providerName) {
    throw ApiError.badRequest("Report provider name is required");
  }

  if (!req.user) {
    throw ApiError.unauthorized("Authentication required");
  }

  const filters = req.body || {};
  const report = await reportService.generateCustomReport(providerName, filters, req.user.email);
  const response = ApiResponse.ok("Custom report generated successfully", report);
  res.status(response.statusCode).json(response);
};

export const exportDirectory = async (req: Request, res: Response): Promise<void> => {
  const entity = req.query["entity"] as string | undefined; // "employees" | "departments"
  const format = (req.query["format"] as string | undefined || "xlsx").toLowerCase() as any;

  if (!entity || !["employees", "departments"].includes(entity)) {
    throw ApiError.badRequest("Query parameter 'entity' must be 'employees' or 'departments'");
  }

  if (!["csv", "xlsx", "json", "pdf"].includes(format)) {
    throw ApiError.badRequest("Query parameter 'format' must be 'csv', 'xlsx', 'json', or 'pdf'");
  }

  let headers: string[] = [];
  let rows: Record<string, any>[] = [];

  if (entity === "employees") {
    headers = ["id", "fullName", "email", "phone", "employeeCode", "designation", "isActive"];
    const employees = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        employeeCode: true,
        designation: true,
        isActive: true,
      },
    });
    rows = employees;
  } else {
    headers = ["id", "name", "code", "description", "status"];
    const departments = await prisma.department.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        status: true,
      },
    });
    rows = departments;
  }

  const exportData = ExportService.export(headers, rows, format, entity);

  // Set download headers
  res.setHeader("Content-Type", exportData.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${exportData.filename}"`);
  res.end(exportData.buffer);
};
