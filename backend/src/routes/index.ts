/**
 * @file    routes/index.ts
 * @desc    Root API router.
 *
 *          Module-level routers (auth, asset, employee, etc.) will be
 *          mounted here in subsequent phases.
 *
 *          Currently exposes only the /health endpoint.
 */

import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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

export default router;
