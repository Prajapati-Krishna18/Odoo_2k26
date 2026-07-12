/**
 * @file    bookingReminder.job.ts
 */
import { prisma } from "../config/prisma.js";
import { notify } from "../modules/notification/notify.js";
import { BookingStatus, NotificationType } from "@prisma/client";

export async function runBookingReminderJob() {
  console.log("⏰  Running booking reminder job...");

  const now = new Date();
  const safetyLowerBound = new Date(now.getTime() - 30 * 60 * 1000); // 30-minute safety lookback
  const targetTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

  try {
    // Find approved bookings starting in the next 1 hour (including 30-min lookback for lag safety)
    const bookings = await prisma.booking.findMany({
      where: {
        status: BookingStatus.APPROVED,
        startTime: {
          gte: safetyLowerBound,
          lte: targetTime,
        },
      },
      include: {
        resource: true,
      },
    });

    for (const b of bookings) {
      // Check if reminder was already sent to avoid duplicate notifications
      const existingNotification = await prisma.notification.findFirst({
        where: {
          bookingId: b.id,
          type: NotificationType.BOOKING_REMINDER,
        },
      });

      if (existingNotification) {
        continue;
      }

      await notify({
        userId: b.userId,
        type: NotificationType.BOOKING_REMINDER,
        title: "Upcoming Booking Reminder 📅",
        message: `Your booking "${b.title}" for "${b.resource.name}" starts soon at ${b.startTime.toLocaleString()}.`,
        bookingId: b.id,
      });
    }
  } catch (error) {
    console.error("❌  Error in booking reminder job:", error);
  }
}
