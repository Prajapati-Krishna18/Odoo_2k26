/**
 * @file    category.service.ts
 * @desc    Business logic for Asset Category module.
 */

import { ApiError } from "../../utils/ApiError.js";
import * as categoryRepo from "./category.repository.js";
import { type CreateCategoryDTO, type UpdateCategoryDTO, type CategoryQueryDTO } from "./category.dto.js";

// ── Service Operations ────────────────────────────────────────

export async function createCategory(dto: CreateCategoryDTO) {
  // 1. Check uniqueness of category name
  const existing = await categoryRepo.findByName(dto.name);
  if (existing) {
    throw ApiError.conflict(`Category name '${dto.name}' already exists`);
  }

  return categoryRepo.create(dto);
}

export async function getCategoryDetails(id: string) {
  const category = await categoryRepo.findById(id);
  if (!category) {
    throw ApiError.notFound("Category not found");
  }
  return category;
}

export async function updateCategory(id: string, dto: UpdateCategoryDTO) {
  const category = await categoryRepo.findById(id);
  if (!category) {
    throw ApiError.notFound("Category not found");
  }

  // 1. Unique name check
  if (dto.name) {
    const existing = await categoryRepo.findByName(dto.name);
    if (existing && existing.id !== id) {
      throw ApiError.conflict(`Category name '${dto.name}' already exists`);
    }
  }

  return categoryRepo.update(id, dto);
}

export async function updateCategoryStatus(id: string, status: "ACTIVE" | "INACTIVE") {
  const category = await categoryRepo.findById(id);
  if (!category) {
    throw ApiError.notFound("Category not found");
  }
  return categoryRepo.updateStatus(id, status);
}

export async function deleteCategory(id: string) {
  const category = await categoryRepo.findById(id);
  if (!category) {
    throw ApiError.notFound("Category not found");
  }

  // Soft delete Category
  return categoryRepo.softDelete(id);
}

export async function listCategories(query: CategoryQueryDTO) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const search = query.search;
  const sortBy = query.sortBy ?? "createdAt";
  const sortOrder = query.sortOrder ?? "desc";
  const status = query.status;

  const result = await categoryRepo.list({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    status,
  } as Required<CategoryQueryDTO>);

  return {
    categories: result.items,
    pagination: {
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    },
  };
}
