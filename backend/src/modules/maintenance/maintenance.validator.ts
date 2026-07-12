/**
 * @file    maintenance.validator.ts
 */
import { z } from "zod";

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const uuidSchema = z.string().regex(uuidRegex, "Invalid UUID");

export const createMaintenanceSchema = z.object({
  resourceId: uuidSchema,
  title: z.string().min(3).max(200).trim(),
  description: z.string().min(5).max(1000).trim(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
});

export const updateMaintenanceSchema = z.object({
  title: z.string().min(3).max(200).trim().optional(),
  description: z.string().min(5).max(1000).trim().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
});

export const approveMaintenanceSchema = z.object({
  scheduledStart: z.coerce.date(),
  scheduledEnd: z.coerce.date(),
}).refine((d) => d.scheduledEnd > d.scheduledStart, {
  message: "Scheduled end must be after scheduled start",
  path: ["scheduledEnd"],
});

export const rejectMaintenanceSchema = z.object({
  rejectedReason: z.string().min(5).max(500).trim(),
});

export const maintenanceQuerySchema = z.object({
  resourceId: uuidSchema.optional(),
  status: z.enum(["REQUESTED", "APPROVED", "REJECTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  reported_by: uuidSchema.optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});
