/**
 * @file    routes/index.ts
 * @desc    Root API router.
 *
 *          Mounts module-level routers and the health-check endpoint.
 */

import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ── Module routers ───────────────────────────────────────────
import authRouter from "../modules/auth/auth.routes.js";
import resourceRouter from "../modules/asset/resource.routes.js";
import bookingRouter from "../modules/booking/booking.routes.js";
import maintenanceRouter from "../modules/maintenance/maintenance.routes.js";
import notificationRouter from "../modules/notification/notification.routes.js";

const router = Router();

// ── Health check ─────────────────────────────────────────────

router.get(
  "/health",
  asyncHandler(async (_req, res) => {
    // Quick connectivity test — will throw if the DB is unreachable
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
router.use("/resources", resourceRouter);
router.use("/bookings", bookingRouter);
router.use("/maintenance", maintenanceRouter);
router.use("/notifications", notificationRouter);

export default router;
