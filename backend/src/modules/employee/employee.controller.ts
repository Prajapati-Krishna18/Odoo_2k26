/**
 * @file    employee.controller.ts
 * @desc    Controller handlers for Employee Directory routes.
 */

import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import * as employeeService from "./employee.service.js";
import {
  updateEmployeeProfileSchema,
  promoteEmployeeSchema,
  transferEmployeeSchema,
  updateStatusSchema,
  employeeQuerySchema,
} from "./employee.validator.js";
import { ActivityLogger } from "../activity/activity.service.js";

export const getDetails = async (req: Request, res: Response): Promise<void> => {
  const id = req.params["id"] as string;
  if (!id) {
    throw ApiError.badRequest("Employee ID is required");
  }

  const employee = await employeeService.getEmployeeDetails(id);
  const response = ApiResponse.ok("Employee profile retrieved successfully", employee);
  res.status(response.statusCode).json(response);
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const id = req.params["id"] as string;
  if (!id) {
    throw ApiError.badRequest("Employee ID is required");
  }

  const parsed = updateEmployeeProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw ApiError.badRequest("Validation failed", errors);
  }

  const employee = await employeeService.updateEmployeeProfile(id, parsed.data);
  if (req.user) {
    ActivityLogger.log(
      req.user.id,
      "UPDATE_PROFILE",
      "EMPLOYEE",
      employee.id,
      `Employee profile for ${employee.fullName} updated`,
      req
    );
  }
  const response = ApiResponse.ok("Employee profile updated successfully", employee);
  res.status(response.statusCode).json(response);
};

export const promote = async (req: Request, res: Response): Promise<void> => {
  const id = req.params["id"] as string;
  if (!id) {
    throw ApiError.badRequest("Employee ID is required");
  }

  // Prevent user from self-promoting
  if (req.user && req.user.id === id) {
    throw ApiError.forbidden("You cannot promote yourself");
  }

  const parsed = promoteEmployeeSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw ApiError.badRequest("Validation failed", errors);
  }

  const employee = await employeeService.promoteEmployee(id, parsed.data);
  if (req.user) {
    ActivityLogger.log(
      req.user.id,
      "ROLE_CHANGE",
      "EMPLOYEE",
      employee.id,
      `Employee ${employee.fullName} promoted to ${parsed.data.roleName}`,
      req
    );
  }
  const response = ApiResponse.ok(`Employee promoted to ${parsed.data.roleName} successfully`, employee);
  res.status(response.statusCode).json(response);
};

export const transfer = async (req: Request, res: Response): Promise<void> => {
  const id = req.params["id"] as string;
  if (!id) {
    throw ApiError.badRequest("Employee ID is required");
  }

  const parsed = transferEmployeeSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw ApiError.badRequest("Validation failed", errors);
  }

  const employee = await employeeService.transferEmployee(id, parsed.data);
  if (req.user) {
    ActivityLogger.log(
      req.user.id,
      "TRANSFER_DEPARTMENT",
      "EMPLOYEE",
      employee.id,
      `Employee ${employee.fullName} transferred to new department`,
      req
    );
  }
  const response = ApiResponse.ok("Employee transferred to new department successfully", employee);
  res.status(response.statusCode).json(response);
};

export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  const id = req.params["id"] as string;
  if (!id) {
    throw ApiError.badRequest("Employee ID is required");
  }

  // Prevent self-deactivation
  if (req.user && req.user.id === id) {
    throw ApiError.forbidden("You cannot activate/deactivate yourself");
  }

  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw ApiError.badRequest("Validation failed", errors);
  }

  const employee = await employeeService.updateEmployeeStatus(id, parsed.data.status);
  if (req.user) {
    ActivityLogger.log(
      req.user.id,
      "UPDATE_STATUS",
      "EMPLOYEE",
      employee.id,
      `Employee ${employee.fullName} status updated to ${parsed.data.status}`,
      req
    );
  }
  const response = ApiResponse.ok(`Employee status updated to ${parsed.data.status}`, employee);
  res.status(response.statusCode).json(response);
};

export const list = async (req: Request, res: Response): Promise<void> => {
  const parsed = employeeQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw ApiError.badRequest("Validation failed", errors);
  }

  const result = await employeeService.listEmployees(parsed.data);
  const response = ApiResponse.ok("Employee directory retrieved successfully", result);
  res.status(response.statusCode).json(response);
};
