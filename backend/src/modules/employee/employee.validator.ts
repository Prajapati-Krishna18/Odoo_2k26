/**
 * @file    employee.validator.ts
 * @desc    Zod schemas for validating Employee Directory requests.
 */

import { z } from "zod";

export const updateEmployeeProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters")
    .trim()
    .optional(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .max(15, "Phone number must be at most 15 characters")
    .trim()
    .optional(),
  profileImage: z.string().url("Invalid profile image URL").optional(),
  designation: z.string().max(100, "Designation cannot exceed 100 characters").trim().optional(),
  joiningDate: z.string().datetime("Invalid ISO date format").optional(),
});

export const promoteEmployeeSchema = z.object({
  roleName: z.enum(["EMPLOYEE", "DEPARTMENT_HEAD", "ASSET_MANAGER"] as const),
});

export const transferEmployeeSchema = z.object({
  departmentId: z.string().uuid("Invalid department ID"),
});

export const updateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"] as const),
});

export const employeeQuerySchema = z.object({
  page: z.preprocess((val) => val ? parseInt(val as string, 10) : undefined, z.number().int().min(1).default(1)),
  limit: z.preprocess((val) => val ? parseInt(val as string, 10) : undefined, z.number().int().min(1).max(100).default(10)),
  search: z.string().optional(),
  departmentId: z.string().uuid("Invalid department ID").optional(),
  roleId: z.string().uuid("Invalid role ID").optional(),
  roleName: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"] as const).optional(),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"] as const).default("desc"),
});
