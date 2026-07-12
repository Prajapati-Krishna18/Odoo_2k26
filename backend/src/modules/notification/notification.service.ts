/**
 * @file    notification.service.ts
 * @desc    Business logic and shared alert utility for Notifications.
 */

import * as notificationRepo from "./notification.repository.js";
import { type NotificationQueryDTO } from "./notification.dto.js";
import { ApiError } from "../../utils/ApiError.js";

// ── NotificationService Utility Class ────────────────────────

export class NotificationService {
  /**
   * Send a system notification to a specific user.
   * Runs asynchronously in the background so it doesn't block the caller.
   */
  static send(userId: string, title: string, message: string, type: string = "INFO"): void {
    notificationRepo
      .create({
        userId,
        title,
        message,
        type,
      })
      .catch((err) => {
        console.error("❌  Failed to send notification:", err);
      });
  }
}

// ── Service Operations ────────────────────────────────────────

export async function getNotifications(userId: string, query: NotificationQueryDTO) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const isRead = query.isRead;

  const result = await notificationRepo.list(userId, {
    page,
    limit,
    isRead,
  } as Required<NotificationQueryDTO>);

  return {
    notifications: result.items,
    pagination: {
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    },
  };
}

export async function readNotification(id: string, userId: string) {
  const notification = await notificationRepo.findByIdAndUser(id, userId);
  if (!notification) {
    throw ApiError.notFound("Notification not found");
  }

  await notificationRepo.markAsRead(id, userId);
}

export async function readAllNotifications(userId: string) {
  await notificationRepo.markAllRead(userId);
}

export async function deleteNotification(id: string, userId: string) {
  const notification = await notificationRepo.findByIdAndUser(id, userId);
  if (!notification) {
    throw ApiError.notFound("Notification not found");
  }

  await notificationRepo.remove(id, userId);
}
