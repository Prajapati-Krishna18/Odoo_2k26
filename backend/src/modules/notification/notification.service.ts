/**
 * @file    notification.service.ts
 */
import { ApiError } from "../../utils/ApiError.js";
import * as repo from "./notification.repository.js";

export async function getNotifications(userId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [items, total, unreadCount] = await Promise.all([
    repo.findByUser(userId, skip, limit),
    repo.countByUser(userId),
    repo.countUnread(userId),
  ]);
  return { items, unreadCount, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function markRead(id: string, userId: string) {
  const n = await repo.findById(id);
  if (!n) throw ApiError.notFound("Notification not found");
  if (n.userId !== userId) throw ApiError.forbidden("Access denied");
  return repo.markRead(id);
}

export async function markAllRead(userId: string) {
  return repo.markAllRead(userId);
}

export async function deleteNotification(id: string, userId: string) {
  const n = await repo.findById(id);
  if (!n) throw ApiError.notFound("Notification not found");
  if (n.userId !== userId) throw ApiError.forbidden("Access denied");
  return repo.remove(id);
}
