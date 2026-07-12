/**
 * @file    booking.validator.ts
 * @desc    Base Zod schemas. Type-specific validation (capacity, purpose, equipment count)
 *          happens in booking.service.ts after the resource is loaded from the DB,
 *          because those checks require the resource record.
 */
import { z } from "zod";

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const uuidSchema = z.string().regex(uuidRegex, "Invalid UUID");

export const createBookingSchema = z
  .object({
    resourceId: uuidSchema,
    title: z.string().min(3).max(200).trim(),
    description: z.string().max(1000).optional(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    attendeeCount: z.number().int().positive().optional(),
    purpose: z.string().max(500).optional(),
    returnCondition: z.string().max(500).optional(),
  })
  .refine((d) => d.endTime > d.startTime, { message: "End time must be after start time", path: ["endTime"] })
  .refine((d) => d.startTime > new Date(), { message: "Start time must be in the future", path: ["startTime"] });

export const updateBookingSchema = z
  .object({
    title: z.string().min(3).max(200).trim().optional(),
    description: z.string().max(1000).optional(),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional(),
    attendeeCount: z.number().int().positive().optional(),
    purpose: z.string().max(500).optional(),
    returnCondition: z.string().max(500).optional(),
  })
  .refine((d) => !d.startTime || !d.endTime || d.endTime > d.startTime, {
    message: "End time must be after start time", path: ["endTime"],
  });

export const rejectBookingSchema = z.object({ rejectedReason: z.string().min(5).max(500) });
export const cancelBookingSchema = z.object({ cancelReason: z.string().max(500).optional() });

export const bookingQuerySchema = z.object({
  resourceId: uuidSchema.optional(),
  userId: uuidSchema.optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED", "COMPLETED"]).optional(),
  type: z.enum(["MEETING_ROOM", "VEHICLE", "EQUIPMENT"]).optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

export const calendarQuerySchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  resourceId: uuidSchema.optional(),
  type: z.enum(["MEETING_ROOM", "VEHICLE", "EQUIPMENT"]).optional(),
});

export const availabilityQuerySchema = z.object({
  resource_id: uuidSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
});
