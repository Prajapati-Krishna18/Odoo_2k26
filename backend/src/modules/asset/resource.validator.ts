/**
 * @file    resource.validator.ts
 */
import { z } from "zod";

export const createResourceSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  type: z.enum(["MEETING_ROOM", "VEHICLE", "EQUIPMENT"]),
  description: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  capacity: z.number().int().positive().optional(),
  quantity: z.number().int().positive().default(1),
  imageUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateResourceSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  description: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  capacity: z.number().int().positive().optional(),
  quantity: z.number().int().positive().optional(),
  status: z.enum(["AVAILABLE", "MAINTENANCE", "INACTIVE"]).optional(),
  imageUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const resourceQuerySchema = z.object({
  type: z.enum(["MEETING_ROOM", "VEHICLE", "EQUIPMENT"]).optional(),
  status: z.enum(["AVAILABLE", "MAINTENANCE", "INACTIVE"]).optional(),
  page: z.string().transform(Number).default(1),
  limit: z.string().transform(Number).default(20),
});
