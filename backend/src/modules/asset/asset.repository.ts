/**
 * @file    asset.repository.ts
 * @desc    Data-access layer for Asset entity.
 */

import { prisma } from "../../config/prisma.js";

// ── Queries ──────────────────────────────────────────────────

export const findById = (id: string) =>
  prisma.asset.findUnique({
    where: { id },
  });

export const findByAssetTag = (assetTag: string) =>
  prisma.asset.findUnique({
    where: { assetTag },
  });

export const findBySerialNumber = (serialNumber: string) =>
  prisma.asset.findUnique({
    where: { serialNumber },
  });

export const create = (data: {
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
}) =>
  prisma.asset.create({
    data: {
      assetTag: data.assetTag,
      serialNumber: data.serialNumber,
      assetName: data.assetName,
      description: data.description,
      manufacturer: data.manufacturer,
      modelNumber: data.modelNumber,
      purchaseDate: data.purchaseDate,
      purchaseCost: data.purchaseCost,
      warrantyExpiry: data.warrantyExpiry,
      location: data.location,
      categoryId: data.categoryId,
      status: data.status,
      condition: data.condition,
      ownerId: data.ownerId,
      departmentId: data.departmentId,
      qrCode: data.qrCode,
    },
  });

export const update = (id: string, data: any) =>
  prisma.asset.update({
    where: { id },
    data,
  });

export const updateStatus = (id: string, status: string) =>
  prisma.asset.update({
    where: { id },
    data: { status },
  });

export const remove = (id: string) =>
  prisma.asset.delete({
    where: { id },
  });

export const list = async (query: { page: number; limit: number }) => {
  const [total, items] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.findMany({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { total, items };
};
