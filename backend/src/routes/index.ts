/**
 * @file    routes/index.ts
 * @desc    Root API router.
 *          Mounts module-level routers and the health-check endpoint.
 */

import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ── Module routers ───────────────────────────────────────────
import authRouter from "../modules/auth/auth.routes.js";
import departmentRouter from "../modules/department/department.routes.js";
import categoryRouter from "../modules/category/category.routes.js";
import employeeRouter from "../modules/employee/employee.routes.js";
import dashboardRouter from "../modules/dashboard/dashboard.routes.js";
import notificationRouter from "../modules/notification/notification.routes.js";
import activityRouter from "../modules/activity/activity.routes.js";
import uploadRouter from "../modules/upload/upload.routes.js";
import searchRouter from "../modules/search/search.routes.js";
import reportRouter from "../modules/report/report.routes.js";
import analyticsRouter from "../modules/analytics/analytics.routes.js";
import settingsRouter from "../modules/settings/settings.routes.js";
import systemRouter from "../modules/system/system.routes.js";

// Restored asset/booking/maintenance routes
import resourceRouter from "../modules/asset/resource.routes.js";
import bookingRouter from "../modules/booking/booking.routes.js";
import maintenanceRouter from "../modules/maintenance/maintenance.routes.js";

const router = Router();

// ── Health check ─────────────────────────────────────────────

router.get(
  "/health",
  asyncHandler(async (_req, res) => {
    let dbStatus: "connected" | "disconnected" = "disconnected";
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = "connected";
    } catch {
      dbStatus = "disconnected";
    }

    const payload = {
      database: dbStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };

    const response = ApiResponse.ok("AssetFlow API is healthy", payload);
    res.status(response.statusCode).json(response);
  })
);

// ── Module routes ────────────────────────────────────────────

router.use("/auth", authRouter);
router.use("/departments", departmentRouter);
router.use("/categories", categoryRouter);
router.use("/employees", employeeRouter);
router.use("/dashboard", dashboardRouter);
router.use("/notifications", notificationRouter);
router.use("/activities", activityRouter);
router.use("/upload", uploadRouter);
router.use("/search", searchRouter);
router.use("/reports", reportRouter);
router.use("/analytics", analyticsRouter);
router.use("/settings", settingsRouter);
router.use("/system", systemRouter);

// Restored routes
router.use("/assets", resourceRouter);
router.use("/bookings", bookingRouter);
router.use("/maintenance", maintenanceRouter);

export default router;
