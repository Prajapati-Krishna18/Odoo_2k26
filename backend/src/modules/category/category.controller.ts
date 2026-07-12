/**
 * @file    category.controller.ts
 * @desc    Controller handlers for Asset Category routes.
 */

import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import * as categoryService from "./category.service.js";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
  updateCategoryStatusSchema,
} from "./category.validator.js";

export const create = async (req: Request, res: Response): Promise<void> => {
  const parsed = createCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw ApiError.badRequest("Validation failed", errors);
  }

  const category = await categoryService.createCategory(parsed.data);
  const response = ApiResponse.created("Category created successfully", category);
  res.status(response.statusCode).json(response);
};

export const getDetails = async (req: Request, res: Response): Promise<void> => {
  const id = req.params["id"] as string;
  if (!id) {
    throw ApiError.badRequest("Category ID is required");
  }

  const category = await categoryService.getCategoryDetails(id);
  const response = ApiResponse.ok("Category details retrieved successfully", category);
  res.status(response.statusCode).json(response);
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = req.params["id"] as string;
  if (!id) {
    throw ApiError.badRequest("Category ID is required");
  }

  const parsed = updateCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw ApiError.badRequest("Validation failed", errors);
  }

  const category = await categoryService.updateCategory(id, parsed.data);
  const response = ApiResponse.ok("Category updated successfully", category);
  res.status(response.statusCode).json(response);
};

export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  const id = req.params["id"] as string;
  if (!id) {
    throw ApiError.badRequest("Category ID is required");
  }

  const parsed = updateCategoryStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw ApiError.badRequest("Validation failed", errors);
  }

  const category = await categoryService.updateCategoryStatus(id, parsed.data.status);
  const response = ApiResponse.ok(`Category status updated to ${parsed.data.status}`, category);
  res.status(response.statusCode).json(response);
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = req.params["id"] as string;
  if (!id) {
    throw ApiError.badRequest("Category ID is required");
  }

  await categoryService.deleteCategory(id);
  const response = ApiResponse.ok("Category deleted successfully", null);
  res.status(response.statusCode).json(response);
};

export const list = async (req: Request, res: Response): Promise<void> => {
  const parsed = categoryQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw ApiError.badRequest("Validation failed", errors);
  }

  const result = await categoryService.listCategories(parsed.data);
  const response = ApiResponse.ok("Categories listed successfully", result);
  res.status(response.statusCode).json(response);
};
