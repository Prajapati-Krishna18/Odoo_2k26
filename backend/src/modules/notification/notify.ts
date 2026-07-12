/**
 * @file    notify.ts
 * @desc    Fire-and-log helper. Inserts a notification row silently.
 *          Never throws — a notification failure must never crash a booking/maintenance flow.
 */
import { NotificationType } from "@prisma/client";
import * as repo from "./notification.repository.js";

export async function notify(data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  bookingId?: string;
  maintenanceRequestId?: string;
}): Promise<void> {
  try {
    await repo.create(data);
  } catch (err) {
    // Log but never propagate — a notification failure must not roll back a booking
    console.error("⚠️  Notification insert failed:", err);
  }
}
