/**
 * @file    booking.controller.ts
 */
import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import * as svc from "./booking.service.js";
import {
  createBookingSchema,
  updateBookingSchema,
  rejectBookingSchema,
  cancelBookingSchema,
  bookingQuerySchema,
  calendarQuerySchema,
  availabilityQuerySchema,
} from "./booking.validator.js";

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();
  const p = createBookingSchema.safeParse(req.body);
  if (!p.success) throw ApiError.badRequest("Validation failed", p.error.issues.map(e => ({ field: e.path.join("."), message: e.message })));
  
  // Set is_exclusive based on the resource type
  // This is handled inside booking.service.ts, but let's pass the data through.
  const booking = await svc.createBooking(req.user.id, p.data);
  res.status(201).json(ApiResponse.created("Booking created", booking));
};

export const getBookings = async (req: Request, res: Response): Promise<void> => {
  const p = bookingQuerySchema.safeParse(req.query);
  if (!p.success) throw ApiError.badRequest("Invalid query", p.error.issues.map(e => ({ field: e.path.join("."), message: e.message })));
  res.json(ApiResponse.ok("Bookings retrieved", await svc.getBookings(p.data)));
};

export const getCalendar = async (req: Request, res: Response): Promise<void> => {
  const p = calendarQuerySchema.safeParse(req.query);
  if (!p.success) throw ApiError.badRequest("Invalid query", p.error.issues.map(e => ({ field: e.path.join("."), message: e.message })));
  res.json(ApiResponse.ok("Calendar events retrieved", await svc.getCalendar(p.data)));
};

export const getAvailability = async (req: Request, res: Response): Promise<void> => {
  const p = availabilityQuerySchema.safeParse(req.query);
  if (!p.success) throw ApiError.badRequest("Invalid query", p.error.issues.map(e => ({ field: e.path.join("."), message: e.message })));
  res.json(ApiResponse.ok("Availability retrieved", await svc.getAvailability(p.data.resource_id, p.data.date)));
};

export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  res.json(ApiResponse.ok("Booking retrieved", await svc.getBookingById(req.params.id as string)));
};

export const updateBooking = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();
  const p = updateBookingSchema.safeParse(req.body);
  if (!p.success) throw ApiError.badRequest("Validation failed", p.error.issues.map(e => ({ field: e.path.join("."), message: e.message })));
  res.json(ApiResponse.ok("Booking updated", await svc.updateBooking(req.params.id as string, req.user.id, req.user.role, p.data)));
};

export const approveBooking = async (req: Request, res: Response): Promise<void> => {
  res.json(ApiResponse.ok("Booking approved", await svc.approveBooking(req.params.id as string)));
};

export const rejectBooking = async (req: Request, res: Response): Promise<void> => {
  const p = rejectBookingSchema.safeParse(req.body);
  if (!p.success) throw ApiError.badRequest("Validation failed", p.error.issues.map(e => ({ field: e.path.join("."), message: e.message })));
  res.json(ApiResponse.ok("Booking rejected", await svc.rejectBooking(req.params.id as string, p.data)));
};

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();
  const p = cancelBookingSchema.safeParse(req.body);
  if (!p.success) throw ApiError.badRequest("Validation failed", p.error.issues.map(e => ({ field: e.path.join("."), message: e.message })));
  res.json(ApiResponse.ok("Booking cancelled", await svc.cancelBooking(req.params.id as string, req.user.id, req.user.role, p.data)));
};
