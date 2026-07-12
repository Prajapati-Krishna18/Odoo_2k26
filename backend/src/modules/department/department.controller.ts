/**
 * @file    department.controller.ts
 * @desc    Controller handlers for Department routes.
 */

import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import * as departmentService from "./department.service.js";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  departmentQuerySchema,
  updateStatusSchema,
} from "./department.validator.js";
import { ActivityLogger } from "../activity/activity.service.js";

export const create = async (req: Request, res: Response): Promise<void> => {
  const parsed = createDepartmentSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw ApiError.badRequest("Validation failed", errors);
  }

  const department = await departmentService.createDepartment(parsed.data);
  if (req.user) {
    ActivityLogger.log(
      req.user.id,
      "CREATE",
      "DEPARTMENT",
      department.id,
      `Department '${department.name}' (Code: ${department.code}) created`,
      req
    );
  }
  const response = ApiResponse.created("Department created successfully", department);
  res.status(response.statusCode).json(response);
};

export const getDetails = async (req: Request, res: Response): Promise<void> => {
  const id = req.params["id"] as string;
  if (!id) {
    throw ApiError.badRequest("Department ID is required");
  }

  const department = await departmentService.getDepartmentDetails(id);
  const response = ApiResponse.ok("Department details retrieved successfully", department);
  res.status(response.statusCode).json(response);
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = req.params["id"] as string;
  if (!id) {
    throw ApiError.badRequest("Department ID is required");
  }

  const parsed = updateDepartmentSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw ApiError.badRequest("Validation failed", errors);
  }

  const department = await departmentService.updateDepartment(id, parsed.data);
  if (req.user) {
    ActivityLogger.log(
      req.user.id,
      "UPDATE",
      "DEPARTMENT",
      department.id,
      `Department '${department.name}' (Code: ${department.code}) updated`,
      req
    );
  }
  const response = ApiResponse.ok("Department updated successfully", department);
  res.status(response.statusCode).json(response);
};

export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  const id = req.params["id"] as string;
  if (!id) {
    throw ApiError.badRequest("Department ID is required");
  }

  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw ApiError.badRequest("Validation failed", errors);
  }

  const department = await departmentService.updateDepartmentStatus(id, parsed.data.status);
  if (req.user) {
    ActivityLogger.log(
      req.user.id,
      "UPDATE_STATUS",
      "DEPARTMENT",
      department.id,
      `Department '${department.name}' (Code: ${department.code}) status changed to ${parsed.data.status}`,
      req
    );
  }
  const response = ApiResponse.ok(`Department status updated to ${parsed.data.status}`, department);
  res.status(response.statusCode).json(response);
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = req.params["id"] as string;
  if (!id) {
    throw ApiError.badRequest("Department ID is required");
  }

  await departmentService.deleteDepartment(id);
  if (req.user) {
    ActivityLogger.log(
      req.user.id,
      "DELETE",
      "DEPARTMENT",
      id,
      "Department deleted successfully",
      req
    );
  }
  const response = ApiResponse.ok("Department deleted successfully", null);
  res.status(response.statusCode).json(response);
};

export const list = async (req: Request, res: Response): Promise<void> => {
  const parsed = departmentQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw ApiError.badRequest("Validation failed", errors);
  }

  const result = await departmentService.listDepartments(parsed.data);
  const response = ApiResponse.ok("Departments listed successfully", result);
  res.status(response.statusCode).json(response);
};
