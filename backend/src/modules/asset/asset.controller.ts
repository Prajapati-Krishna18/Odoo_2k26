/**
 * @file    asset.controller.ts
 * @desc    Controller handlers for Asset routes.
 */

import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import * as assetService from "./asset.service.js";
import { createAssetSchema } from "./asset.validation.js";

export const create = async (req: Request, res: Response): Promise<void> => {
  const parsed = createAssetSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw ApiError.badRequest("Validation failed", errors);
  }

  const assetData = {
    ...parsed.data,
    purchaseDate: new Date(parsed.data.purchaseDate),
    warrantyExpiry: parsed.data.warrantyExpiry ? new Date(parsed.data.warrantyExpiry) : undefined,
  };

  const asset = await assetService.createAsset(assetData);
  const response = ApiResponse.created("Asset created successfully", asset);
  res.status(response.statusCode).json(response);
};

export const list = async (req: Request, res: Response): Promise<void> => {
  const result = await assetService.listAssets(req.query);
  const response = ApiResponse.ok("Assets listed successfully", result);
  res.status(response.statusCode).json(response);
};

export const getDetails = async (req: Request, res: Response): Promise<void> => {
  const id = req.params["id"] as string;
  if (!id) {
    throw ApiError.badRequest("Asset ID is required");
  }

  const asset = await assetService.getAssetDetails(id);
  const response = ApiResponse.ok("Asset details retrieved successfully", asset);
  res.status(response.statusCode).json(response);
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = req.params["id"] as string;
  if (!id) {
    throw ApiError.badRequest("Asset ID is required");
  }

  const asset = await assetService.updateAsset(id, req.body);
  const response = ApiResponse.ok("Asset updated successfully", asset);
  res.status(response.statusCode).json(response);
};

export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  const id = req.params["id"] as string;
  if (!id) {
    throw ApiError.badRequest("Asset ID is required");
  }

  const { status } = req.body;
  if (!status) {
    throw ApiError.badRequest("Status is required");
  }

  const asset = await assetService.updateAssetStatus(id, status);
  const response = ApiResponse.ok(`Asset status updated to ${status}`, asset);
  res.status(response.statusCode).json(response);
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = req.params["id"] as string;
  if (!id) {
    throw ApiError.badRequest("Asset ID is required");
  }

  await assetService.deleteAsset(id);
  const response = ApiResponse.ok("Asset deleted successfully", null);
  res.status(response.statusCode).json(response);
};
