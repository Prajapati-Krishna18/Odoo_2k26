/**
 * @file    notification.repository.ts
 * @desc    All DB queries for notifications. Kept thin — no business logic.
 */
import { prisma } from "../../config/prisma.js";
import { NotificationType } from "@prisma/client";

export const create = (data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  bookingId?: string;
  maintenanceRequestId?: string;
}) => prisma.notification.create({ data });

export const findByUser = (userId: string, skip: number, take: number) =>
  prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip, take,
    include: {
      booking: { select: { id: true, title: true } },
      maintenanceRequest: { select: { id: true, title: true } },
    },
  });

export const countByUser = (userId: string) =>
  prisma.notification.count({ where: { userId } });

export const countUnread = (userId: string) =>
  prisma.notification.count({ where: { userId, isRead: false } });

export const findById = (id: string) =>
  prisma.notification.findUnique({ where: { id } });

export const markRead = (id: string) =>
  prisma.notification.update({ where: { id }, data: { isRead: true } });

export const markAllRead = (userId: string) =>
  prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });

export const remove = (id: string) =>
  prisma.notification.delete({ where: { id } });
