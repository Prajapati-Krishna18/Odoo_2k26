/**
 * @file    category.repository.ts
 * @desc    Data-access layer for AssetCategory entity.
 */

import { prisma } from "../../config/prisma.js";
import { type CreateCategoryDTO, type UpdateCategoryDTO, type CategoryQueryDTO } from "./category.dto.js";

// ── Queries ──────────────────────────────────────────────────

export const findById = (id: string) =>
  prisma.assetCategory.findUnique({
    where: { id, isDeleted: false },
  });

export const findByName = (name: string) =>
  prisma.assetCategory.findUnique({
    where: { name, isDeleted: false },
  });

export const create = (data: CreateCategoryDTO) =>
  prisma.assetCategory.create({
    data: {
      name: data.name,
      description: data.description,
      icon: data.icon,
      requiresWarranty: data.requiresWarranty,
    },
  });

export const update = (id: string, data: UpdateCategoryDTO) =>
  prisma.assetCategory.update({
    where: { id },
    data,
  });

export const updateStatus = (id: string, status: "ACTIVE" | "INACTIVE") =>
  prisma.assetCategory.update({
    where: { id },
    data: { status },
  });

export const softDelete = (id: string) =>
  prisma.assetCategory.update({
    where: { id },
    data: { isDeleted: true },
  });

export const list = async (query: Required<CategoryQueryDTO>) => {
  const where: any = { isDeleted: false };

  if (query.status) {
    where.status = query.status;
  }

  if (query.search) {
    where.name = { contains: query.search, mode: "insensitive" };
  }

  const [total, items] = await Promise.all([
    prisma.assetCategory.count({ where }),
    prisma.assetCategory.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { [query.sortBy]: query.sortOrder },
    }),
  ]);

  return { total, items };
};
