/**
 * @file    category.dto.ts
 * @desc    Data Transfer Objects for the Asset Category module.
 */

export interface CreateCategoryDTO {
  name: string;
  description?: string;
  icon?: string;
  requiresWarranty?: boolean;
}

export interface UpdateCategoryDTO {
  name?: string;
  description?: string;
  icon?: string;
  requiresWarranty?: boolean;
}

export interface CategoryQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: "ACTIVE" | "INACTIVE";
}

export interface CategoryResponseDTO {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  requiresWarranty: boolean;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}
