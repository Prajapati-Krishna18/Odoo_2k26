/**
 * @file    maintenanceStartingSoon.job.ts
 */
import { prisma } from "../config/prisma.js";
import { notify } from "../modules/notification/notify.js";
import { MaintenanceStatus, NotificationType } from "@prisma/client";

export async function runMaintenanceStartingSoonJob() {
  console.log("⏰  Running maintenance starting soon job...");
  
  const now = new Date();
  const safetyLowerBound = new Date(now.getTime() - 60 * 60 * 1000); // 1-hour safety lookback
  const targetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  try {
    // Find approved requests starting in the next 24 hours (including 1-hour lookback for lag safety)
    const requests = await prisma.maintenanceRequest.findMany({
      where: {
        status: MaintenanceStatus.APPROVED,
        scheduledStart: {
          gte: safetyLowerBound,
          lte: targetTime,
        },
      },
      include: {
        resource: true,
      },
    });

    for (const req of requests) {
      // Check if reminder was already sent to avoid duplicate notifications
      const existingNotification = await prisma.notification.findFirst({
        where: {
          maintenanceRequestId: req.id,
          type: NotificationType.MAINTENANCE_STARTING_SOON,
        },
      });

      if (existingNotification) {
        continue;
      }

      // 1. Notify reporter
      await notify({
        userId: req.requestedById,
        type: NotificationType.MAINTENANCE_STARTING_SOON,
        title: "Maintenance Starting Soon 🔧",
        message: `Scheduled maintenance for "${req.resource.name}" starts soon on ${req.scheduledStart?.toLocaleString()}.`,
        maintenanceRequestId: req.id,
      });

      // 2. Notify approver (if assigned)
      if (req.approvedById) {
        await notify({
          userId: req.approvedById,
          type: NotificationType.MAINTENANCE_STARTING_SOON,
          title: "Assigned Maintenance Starting Soon",
          message: `The maintenance you approved for "${req.resource.name}" starts soon.`,
          maintenanceRequestId: req.id,
        });
      }
    }
  } catch (error) {
    console.error("❌  Error in maintenance starting soon job:", error);
  }
}
