/**
 * @file    asset.service.ts
 * @desc    Business logic for Asset module.
 */

import { ApiError } from "../../utils/ApiError.js";
import * as assetRepo from "./asset.repository.js";

// ── Service Operations ────────────────────────────────────────

export async function createAsset(data: {
  assetTag: string;
  serialNumber: string;
  assetName: string;
  description?: string;
  manufacturer: string;
  modelNumber: string;
  purchaseDate: Date;
  purchaseCost: number;
  warrantyExpiry?: Date;
  location: string;
  categoryId: string;
  status: string;
  condition: string;
  ownerId?: string;
  departmentId?: string;
  qrCode?: string;
}) {
  const existingAssetByTag = await assetRepo.findByAssetTag(data.assetTag);
  if (existingAssetByTag) {
    throw ApiError.conflict("Asset with this tag already exists");
  }

  const existingAssetBySerial = await assetRepo.findBySerialNumber(data.serialNumber);
  if (existingAssetBySerial) {
    throw ApiError.conflict("Asset with this serial number already exists");
  }

  return assetRepo.create(data);
}

export async function listAssets(query: any) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;

  const result = await assetRepo.list({ page, limit });

  return {
    assets: result.items,
    pagination: {
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    },
  };
}

export async function getAssetDetails(id: string) {
  const asset = await assetRepo.findById(id);
  if (!asset) {
    throw ApiError.notFound("Asset not found");
  }
  return asset;
}

export async function updateAsset(id: string, data: any) {
  const asset = await assetRepo.findById(id);
  if (!asset) {
    throw ApiError.notFound("Asset not found");
  }

  return assetRepo.update(id, data);
}

export async function updateAssetStatus(id: string, status: string) {
  const asset = await assetRepo.findById(id);
  if (!asset) {
    throw ApiError.notFound("Asset not found");
  }

  return assetRepo.updateStatus(id, status);
}

export async function deleteAsset(id: string) {
  const asset = await assetRepo.findById(id);
  if (!asset) {
    throw ApiError.notFound("Asset not found");
  }

  return assetRepo.remove(id);
}
