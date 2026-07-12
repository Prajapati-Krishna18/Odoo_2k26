/**
 * @file    booking.service.ts
 *
 * Race-condition strategy:
 * - quantity = 1 resources (rooms, vehicles): the btree_gist exclusion constraint
 *   in Postgres catches true simultaneous double-bookings at the DB level and
 *   raises error code 23P01. We map that to a 409 response.
 * - quantity > 1 equipment: we use a Prisma interactive transaction with
 *   SELECT FOR UPDATE on the resource row, then count current overlapping
 *   bookings. If count >= quantity → 409. This serializes concurrent requests
 *   for the same resource without a complex exclusion constraint.
 *
 * Type-specific validation:
 * - MEETING_ROOM: attendeeCount must not exceed resource.capacity (if provided)
 * - VEHICLE: purpose is required
 * - EQUIPMENT: multi-unit availability check via FOR UPDATE transaction
 */
import { ApiError } from "../../utils/ApiError.js";
import { prisma } from "../../config/prisma.js";
import * as repo from "./booking.repository.js";
import * as resourceRepo from "../asset/resource.repository.js";
import { notify } from "../notification/notify.js";
import type { CreateBookingDTO, UpdateBookingDTO, RejectBookingDTO, CancelBookingDTO } from "./booking.dto.js";
import { BookingStatus, ResourceType, MaintenanceStatus } from "@prisma/client";

// ── Type-specific validation ─────────────────────────────────

async function validateTypeSpecific(
  resource: Awaited<ReturnType<typeof resourceRepo.findResourceById>>,
  dto: CreateBookingDTO | UpdateBookingDTO,
  bookingId?: string
) {
  if (!resource) return;

  if (resource.type === "MEETING_ROOM") {
    if (dto.attendeeCount !== undefined && resource.capacity !== null && resource.capacity !== undefined) {
      if (dto.attendeeCount > resource.capacity) {
        throw ApiError.badRequest(
          `Attendee count (${dto.attendeeCount}) exceeds room capacity (${resource.capacity})`,
          [{ field: "attendeeCount", message: `Max capacity is ${resource.capacity}` }]
        );
      }
    }
  }

  if (resource.type === "VEHICLE") {
    const createDto = dto as CreateBookingDTO;
    if (!createDto.purpose?.trim()) {
      throw ApiError.badRequest("A trip purpose is required for vehicle bookings", [
        { field: "purpose", message: "purpose is required for VEHICLE bookings" },
      ]);
    }
  }
}

// ── Conflict guard ────────────────────────────────────────────

async function guardConflict(
  resource: NonNullable<Awaited<ReturnType<typeof resourceRepo.findResourceById>>>,
  startTime: Date,
  endTime: Date,
  excludeId?: string
): Promise<void> {
  // Check for overlapping maintenance windows first
  const maintenanceOverlap = await prisma.maintenanceRequest.count({
    where: {
      resourceId: resource.id,
      status: { in: [MaintenanceStatus.APPROVED, MaintenanceStatus.IN_PROGRESS] },
      AND: [
        { scheduledStart: { lt: endTime } },
        { scheduledEnd: { gt: startTime } },
      ],
    },
  });

  if (maintenanceOverlap > 0) {
    throw ApiError.conflict(
      `"${resource.name}" is scheduled for maintenance during this time slot`,
      [{ field: "startTime/endTime", message: "Resource under scheduled maintenance" }]
    );
  }

  if (resource.quantity > 1) {
    // Equipment multi-unit: use a FOR UPDATE transaction to count overlapping bookings
    // This serializes concurrent requests for the same resource.
    await prisma.$transaction(async (tx) => {
      // Lock the resource row
      await tx.$queryRaw`SELECT id FROM resources WHERE id = ${resource.id} FOR UPDATE`;
      const overlapping = await tx.booking.count({
        where: {
          resourceId: resource.id,
          id: excludeId ? { not: excludeId } : undefined,
          status: { in: ["PENDING", "APPROVED"] },
          AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
        },
      });
      if (overlapping >= resource.quantity) {
        throw ApiError.conflict(
          `No units available — all ${resource.quantity} unit(s) of "${resource.name}" are booked for this window`,
          [{ field: "startTime/endTime", message: "All units booked in this time window", conflicts: overlapping }]
        );
      }
    });
  } else {
    // Single-unit: simple overlap check (btree_gist exclusion constraint handles true race at DB level)
    const conflicts = await repo.findOverlapping(resource.id, startTime, endTime, excludeId);
    if (conflicts.length > 0) {
      throw ApiError.conflict(
        `"${resource.name}" is already booked for the selected time slot`,
        [{ field: "startTime/endTime", message: "Time slot conflict", conflicts: conflicts.length }]
      );
    }
  }
}

// ── createBooking ────────────────────────────────────────────

export async function createBooking(userId: string, dto: CreateBookingDTO) {
  const resource = await resourceRepo.findResourceById(dto.resourceId);
  if (!resource) throw ApiError.notFound("Resource not found");
  if (resource.status === "INACTIVE") throw ApiError.badRequest("Resource is inactive and cannot be booked");
  if (resource.status === "MAINTENANCE") throw ApiError.conflict("Resource is under maintenance for this period");

  await validateTypeSpecific(resource, dto);
  await guardConflict(resource, dto.startTime, dto.endTime);

  let booking;
  try {
    booking = await repo.create({
      ...dto,
      userId,
      isExclusive: resource.quantity === 1,
    });
  } catch (err: unknown) {
    // Map Postgres exclusion constraint violation (23P01) to 409
    if (typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "23P01") {
      throw ApiError.conflict(`"${resource.name}" is already booked for this time slot (concurrent request)`);
    }
    throw err;
  }

  await notify({
    userId,
    type: "BOOKING_CREATED",
    title: "Booking Submitted",
    message: `Your booking "${booking.title}" for ${resource.name} is pending approval.`,
    bookingId: booking.id,
  });

  return booking;
}

// ── getBookings ──────────────────────────────────────────────

export async function getBookings(q: {
  resourceId?: string; userId?: string; status?: string;
  type?: string; page?: number; limit?: number;
}) {
  const page = q.page ?? 1; const limit = q.limit ?? 20; const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    repo.findMany({ resourceId: q.resourceId, userId: q.userId, status: q.status as BookingStatus, type: q.type as ResourceType, skip, take: limit }),
    repo.count({ resourceId: q.resourceId, userId: q.userId, status: q.status as BookingStatus, type: q.type as ResourceType }),
  ]);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

// ── getCalendar ──────────────────────────────────────────────

export async function getCalendar(q: { startDate: Date; endDate: Date; resourceId?: string; type?: string }) {
  const bookings = await repo.findInRange({ startDate: q.startDate, endDate: q.endDate, resourceId: q.resourceId, type: q.type as ResourceType });
  return bookings.map((b) => ({
    id: b.id, title: b.title, startTime: b.startTime, endTime: b.endTime, status: b.status,
    resourceId: b.resourceId, resourceName: b.resource.name, resourceType: b.resource.type,
    userId: b.userId, userName: b.user.fullName,
  }));
}

// ── getAvailability ──────────────────────────────────────────

export async function getAvailability(resourceId: string, dateStr: string) {
  const resource = await resourceRepo.findResourceById(resourceId);
  if (!resource) throw ApiError.notFound("Resource not found");

  const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
  const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

  const [bookings, maintenanceWindows] = await Promise.all([
    repo.findInRange({ startDate: dayStart, endDate: dayEnd, resourceId }),
    repo.findMaintenanceInRange(resourceId, dayStart, dayEnd),
  ]);

  // Build 30-min slots and check if each is free
  const slots: { startTime: string; endTime: string; free: boolean; reason?: string }[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (const min of [0, 30]) {
      const slotStart = new Date(Date.UTC(
        dayStart.getUTCFullYear(), dayStart.getUTCMonth(), dayStart.getUTCDate(), hour, min
      ));
      const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);

      const maintenanceBlock = maintenanceWindows.find(
        (m) => m.scheduledStart! < slotEnd && m.scheduledEnd! > slotStart
      );
      if (maintenanceBlock) {
        slots.push({ startTime: slotStart.toISOString(), endTime: slotEnd.toISOString(), free: false, reason: "maintenance" });
        continue;
      }

      if (resource.quantity > 1) {
        const overlapping = bookings.filter((b) => b.startTime < slotEnd && b.endTime > slotStart).length;
        slots.push({ startTime: slotStart.toISOString(), endTime: slotEnd.toISOString(), free: overlapping < resource.quantity });
      } else {
        const booked = bookings.some((b) => b.startTime < slotEnd && b.endTime > slotStart);
        slots.push({ startTime: slotStart.toISOString(), endTime: slotEnd.toISOString(), free: !booked });
      }
    }
  }
  return { resourceId, date: dateStr, quantity: resource.quantity, slots };
}

// ── getBookingById ───────────────────────────────────────────

export async function getBookingById(id: string) {
  const b = await repo.findById(id);
  if (!b) throw ApiError.notFound("Booking not found");
  return b;
}

// ── updateBooking ────────────────────────────────────────────

export async function updateBooking(id: string, userId: string, role: string, dto: UpdateBookingDTO) {
  const booking = await getBookingById(id);
  if (booking.userId !== userId && !["ADMIN", "ASSET_MANAGER"].includes(role))
    throw ApiError.forbidden("You do not have permission to update this booking");
  if (booking.status !== "PENDING") throw ApiError.badRequest("Only PENDING bookings can be updated");

  if (dto.startTime || dto.endTime) {
    const newStart = dto.startTime ?? booking.startTime;
    const newEnd = dto.endTime ?? booking.endTime;
    if (newEnd <= newStart) {
      throw ApiError.badRequest("End time must be after start time", [
        { field: "endTime", message: "End time must be after start time" },
      ]);
    }
    const resource = await resourceRepo.findResourceById(booking.resourceId);
    await guardConflict(resource!, newStart, newEnd, id);
  }
  await validateTypeSpecific(await resourceRepo.findResourceById(booking.resourceId), dto);
  return repo.updateBooking(id, dto);
}

// ── approveBooking ───────────────────────────────────────────

export async function approveBooking(id: string) {
  const booking = await getBookingById(id);
  if (booking.status !== "PENDING") throw ApiError.badRequest(`Cannot approve a booking with status: ${booking.status}`);
  const updated = await repo.updateBooking(id, { status: "APPROVED" });
  await notify({ userId: booking.userId, type: "BOOKING_APPROVED", title: "Booking Approved ✅",
    message: `Your booking "${booking.title}" for ${booking.resource.name} has been approved.`, bookingId: id });
  return updated;
}

// ── rejectBooking ────────────────────────────────────────────

export async function rejectBooking(id: string, dto: RejectBookingDTO) {
  const booking = await getBookingById(id);
  if (booking.status !== "PENDING") throw ApiError.badRequest(`Cannot reject a booking with status: ${booking.status}`);
  const updated = await repo.updateBooking(id, { status: "REJECTED", rejectedReason: dto.rejectedReason });
  await notify({ userId: booking.userId, type: "BOOKING_REJECTED", title: "Booking Rejected ❌",
    message: `Your booking "${booking.title}" was rejected. Reason: ${dto.rejectedReason}`, bookingId: id });
  return updated;
}

// ── cancelBooking ────────────────────────────────────────────

export async function cancelBooking(id: string, userId: string, role: string, dto: CancelBookingDTO) {
  const booking = await getBookingById(id);
  if (booking.userId !== userId && !["ADMIN", "ASSET_MANAGER"].includes(role))
    throw ApiError.forbidden("You do not have permission to cancel this booking");
  if (["CANCELLED", "COMPLETED", "REJECTED"].includes(booking.status))
    throw ApiError.badRequest(`Cannot cancel a booking with status: ${booking.status}`);
  if (new Date(booking.endTime) < new Date()) {
    throw ApiError.badRequest("Cannot cancel a booking that has already ended");
  }
  const updated = await repo.updateBooking(id, { status: "CANCELLED", cancelReason: dto.cancelReason ?? null });
  await notify({ userId: booking.userId, type: "BOOKING_CANCELLED", title: "Booking Cancelled",
    message: `Your booking "${booking.title}" for ${booking.resource.name} has been cancelled.${dto.cancelReason ? ` Reason: ${dto.cancelReason}` : ""}`, bookingId: id });
  return updated;
}
