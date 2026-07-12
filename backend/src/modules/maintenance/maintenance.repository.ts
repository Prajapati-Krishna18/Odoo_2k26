/**
 * @file    maintenance.repository.ts
 */
import { prisma } from "../../config/prisma.js";
import { MaintenanceStatus, Priority, BookingStatus } from "@prisma/client";

const INCLUDE = {
  resource: { select: { id: true, name: true, type: true, location: true } },
  requestedBy: { select: { id: true, fullName: true, email: true } },
  approvedBy: { select: { id: true, fullName: true, email: true } },
} as const;

export const create = (data: {
  resourceId: string; requestedById: string; title: string; description: string; priority?: Priority;
}) => prisma.maintenanceRequest.create({ data, include: INCLUDE });

export const findMany = (opts: {
  resourceId?: string; status?: MaintenanceStatus; reportedBy?: string; skip?: number; take?: number;
}) =>
  prisma.maintenanceRequest.findMany({
    where: {
      ...(opts.resourceId ? { resourceId: opts.resourceId } : {}),
      ...(opts.status ? { status: opts.status } : {}),
      ...(opts.reportedBy ? { requestedById: opts.reportedBy } : {}),
    },
    include: INCLUDE, orderBy: { createdAt: "desc" }, skip: opts.skip, take: opts.take,
  });

export const count = (opts: { resourceId?: string; status?: MaintenanceStatus; reportedBy?: string }) =>
  prisma.maintenanceRequest.count({
    where: {
      ...(opts.resourceId ? { resourceId: opts.resourceId } : {}),
      ...(opts.status ? { status: opts.status } : {}),
      ...(opts.reportedBy ? { requestedById: opts.reportedBy } : {}),
    },
  });

export const findById = (id: string) => prisma.maintenanceRequest.findUnique({ where: { id }, include: INCLUDE });

export const update = (id: string, data: Partial<{
  title: string; description: string; priority: Priority; status: MaintenanceStatus;
  scheduledStart: Date | null; scheduledEnd: Date | null; startedAt: Date | null; completedAt: Date | null;
  rejectedReason: string | null; approvedById: string | null;
}>) => prisma.maintenanceRequest.update({ where: { id }, data, include: INCLUDE });

export const remove = (id: string) => prisma.maintenanceRequest.delete({ where: { id } });

// Find bookings overlapping with the maintenance window
export const findOverlappingBookings = (resourceId: string, start: Date, end: Date) =>
  prisma.booking.findMany({
    where: {
      resourceId,
      status: { in: ["PENDING", "APPROVED"] },
      AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
    },
    select: { id: true, userId: true, title: true, startTime: true },
  });

// Cancel a list of bookings
export const cancelBookings = (bookingIds: string[], reason: string) =>
  prisma.booking.updateMany({
    where: { id: { in: bookingIds } },
    data: { status: "CANCELLED", cancelReason: reason },
  });
