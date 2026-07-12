/**
 * @file    notification.repository.ts
 * @desc    Data-access layer for the Notification entity.
 */

import { prisma } from "../../config/prisma.js";
import { type CreateNotificationDTO, type NotificationQueryDTO } from "./notification.dto.js";

export const create = (data: CreateNotificationDTO) =>
  prisma.notification.create({
    data: {
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type || "INFO",
    },
  });

export const findByIdAndUser = (id: string, userId: string) =>
  prisma.notification.findFirst({
    where: { id, userId },
  });

export const markAsRead = (id: string, userId: string) =>
  prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });

export const markAllRead = (userId: string) =>
  prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

export const remove = (id: string, userId: string) =>
  prisma.notification.deleteMany({
    where: { id, userId },
  });

export const list = async (userId: string, query: Required<NotificationQueryDTO>) => {
  const where: any = { userId };

  if (query.isRead !== undefined) {
    where.isRead = query.isRead;
  }

  const [total, items] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { total, items };
};
