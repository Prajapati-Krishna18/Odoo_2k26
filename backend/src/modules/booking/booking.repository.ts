/**
 * @file    booking.repository.ts
 * @desc    Thin Prisma query layer. All conflict detection logic lives in service.ts.
 */
import { prisma } from "../../config/prisma.js";
import { BookingStatus, ResourceType } from "@prisma/client";

const INCLUDE = {
  resource: { select: { id: true, name: true, type: true, location: true, capacity: true, quantity: true } },
  user: { select: { id: true, fullName: true, email: true } },
} as const;

export const create = (data: {
  resourceId: string; userId: string; title: string; description?: string;
  startTime: Date; endTime: Date; attendeeCount?: number; purpose?: string; returnCondition?: string;
  isExclusive?: boolean;
}) => prisma.booking.create({ data, include: INCLUDE });

export const findOverlapping = (resourceId: string, startTime: Date, endTime: Date, excludeId?: string) =>
  prisma.booking.findMany({
    where: {
      resourceId,
      id: excludeId ? { not: excludeId } : undefined,
      status: { in: ["PENDING", "APPROVED"] },
      AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
    },
  });

export const countOverlapping = (resourceId: string, startTime: Date, endTime: Date, excludeId?: string) =>
  prisma.booking.count({
    where: {
      resourceId,
      id: excludeId ? { not: excludeId } : undefined,
      status: { in: ["PENDING", "APPROVED"] },
      AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
    },
  });

export const findMany = (opts: {
  resourceId?: string; userId?: string; status?: BookingStatus;
  type?: ResourceType; skip?: number; take?: number;
}) =>
  prisma.booking.findMany({
    where: {
      ...(opts.resourceId ? { resourceId: opts.resourceId } : {}),
      ...(opts.userId ? { userId: opts.userId } : {}),
      ...(opts.status ? { status: opts.status } : {}),
      ...(opts.type ? { resource: { type: opts.type } } : {}),
    },
    include: INCLUDE, orderBy: { startTime: "asc" }, skip: opts.skip, take: opts.take,
  });

export const count = (opts: { resourceId?: string; userId?: string; status?: BookingStatus; type?: ResourceType }) =>
  prisma.booking.count({
    where: {
      ...(opts.resourceId ? { resourceId: opts.resourceId } : {}),
      ...(opts.userId ? { userId: opts.userId } : {}),
      ...(opts.status ? { status: opts.status } : {}),
      ...(opts.type ? { resource: { type: opts.type } } : {}),
    },
  });

export const findById = (id: string) => prisma.booking.findUnique({ where: { id }, include: INCLUDE });

export const findInRange = (opts: { startDate: Date; endDate: Date; resourceId?: string; type?: ResourceType }) =>
  prisma.booking.findMany({
    where: {
      status: { in: ["PENDING", "APPROVED", "COMPLETED"] },
      startTime: { gte: opts.startDate },
      endTime: { lte: opts.endDate },
      ...(opts.resourceId ? { resourceId: opts.resourceId } : {}),
      ...(opts.type ? { resource: { type: opts.type } } : {}),
    },
    include: INCLUDE, orderBy: { startTime: "asc" },
  });

// Also finds approved maintenance windows overlapping the day — used by availability endpoint
export const findMaintenanceInRange = (resourceId: string, startDate: Date, endDate: Date) =>
  prisma.maintenanceRequest.findMany({
    where: {
      resourceId,
      status: { in: ["APPROVED", "IN_PROGRESS"] },
      AND: [{ scheduledStart: { lt: endDate } }, { scheduledEnd: { gt: startDate } }],
    },
    select: { id: true, title: true, scheduledStart: true, scheduledEnd: true, status: true },
  });

export const updateBooking = (id: string, data: Partial<{
  title: string; description: string; startTime: Date; endTime: Date;
  status: BookingStatus; rejectedReason: string | null; cancelReason: string | null;
  attendeeCount: number; purpose: string; returnCondition: string;
}>) => prisma.booking.update({ where: { id }, data, include: INCLUDE });

export const findByUserAndStatus = (userId: string, statuses: BookingStatus[]) =>
  prisma.booking.findMany({ where: { userId, status: { in: statuses } }, include: INCLUDE });
