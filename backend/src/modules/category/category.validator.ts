/**
 * @file    category.validator.ts
 * @desc    Zod validation schemas for Asset Category requests.
 */

import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name must be at most 50 characters")
    .trim(),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  icon: z.string().max(100, "Icon class/identifier cannot exceed 100 characters").optional(),
  requiresWarranty: z.boolean().default(false),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryQuerySchema = z.object({
  page: z.preprocess((val) => val ? parseInt(val as string, 10) : undefined, z.number().int().min(1).default(1)),
  limit: z.preprocess((val) => val ? parseInt(val as string, 10) : undefined, z.number().int().min(1).max(100).default(10)),
  search: z.string().optional(),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"] as const).default("desc"),
  status: z.enum(["ACTIVE", "INACTIVE"] as const).optional(),
});

export const updateCategoryStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"] as const),
});
