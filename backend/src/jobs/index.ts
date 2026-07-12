/**
 * @file    jobs/index.ts
 */
import cron from "node-cron";
import { runMaintenanceStartingSoonJob } from "./maintenanceStartingSoon.job.js";
import { runBookingReminderJob } from "./bookingReminder.job.js";

export function initJobs() {
  console.log("⏰  Initializing background jobs...");

  // Run maintenance starting soon check every hour (on the hour)
  cron.schedule("0 * * * *", () => {
    runMaintenanceStartingSoonJob().catch(console.error);
  });

  // Run booking reminders check every 15 minutes
  cron.schedule("*/15 * * * *", () => {
    runBookingReminderJob().catch(console.error);
  });

  // Run them immediately on startup to check for any missed events (optional, but good for testing)
  runMaintenanceStartingSoonJob().catch(console.error);
  runBookingReminderJob().catch(console.error);
}
