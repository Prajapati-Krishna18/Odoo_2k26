/**
 * @file    department.validator.ts
 * @desc    Zod schemas for validating Department requests.
 */

import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z
    .string()
    .min(2, "Department name must be at least 2 characters")
    .max(100, "Department name must be at most 100 characters")
    .trim(),
  code: z
    .string()
    .min(2, "Department code must be at least 2 characters")
    .max(20, "Department code must be at most 20 characters")
    .toUpperCase()
    .trim(),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  parentDepartmentId: z.string().uuid("Invalid parent department ID").optional(),
  departmentHeadId: z.string().uuid("Invalid department head ID").optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export const departmentQuerySchema = z.object({
  page: z.preprocess((val) => parseInt(val as string, 10), z.number().int().min(1).default(1)),
  limit: z.preprocess((val) => parseInt(val as string, 10), z.number().int().min(1).max(100).default(10)),
  search: z.string().optional(),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"] as const).default("desc"),
  status: z.enum(["ACTIVE", "INACTIVE"] as const).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"] as const),
});
