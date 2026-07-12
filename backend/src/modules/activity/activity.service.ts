/**
 * @file    activity.service.ts
 * @desc    Business logic and shared logger utility for Activity Logs.
 */

import type { Request } from "express";
import * as activityRepo from "./activity.repository.js";
import { type ActivityQueryDTO } from "./activity.dto.js";

// ── ActivityLogger Utility Class ─────────────────────────────

export class ActivityLogger {
  /**
   * Log a user activity/audit trail.
   * Runs asynchronously in the background so it doesn't block response execution.
   */
  static log(
    userId: string,
    action: string,
    module: string,
    entityId: string | null,
    description: string,
    req?: Request
  ): void {
    // Extract network client data
    let ipAddress: string | null = null;
    let userAgent: string | null = null;

    if (req) {
      userAgent = req.headers["user-agent"] || null;
      // Handle standard and reverse proxy ip headers
      const forwarded = req.headers["x-forwarded-for"];
      if (forwarded) {
        ipAddress = Array.isArray(forwarded)
          ? forwarded[0] || null
          : forwarded.split(",")[0]?.trim() || null;
      } else {
        ipAddress = req.ip || req.socket.remoteAddress || null;
      }
    }

    // Fire-and-forget database write to prevent blocking client responses
    activityRepo
      .create({
        userId,
        action,
        module,
        entityId,
        description,
        ipAddress,
        userAgent,
      })
      .catch((err) => {
        console.error("❌  Failed to save activity log:", err);
      });
  }
}

// ── Service Operations ────────────────────────────────────────

export async function listActivities(query: ActivityQueryDTO) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const userId = query.userId;
  const module = query.module;
  const action = query.action;
  const search = query.search;
  const sortBy = query.sortBy ?? "createdAt";
  const sortOrder = query.sortOrder ?? "desc";

  const result = await activityRepo.list({
    page,
    limit,
    userId,
    module,
    action,
    search,
    sortBy,
    sortOrder,
  } as Required<ActivityQueryDTO>);

  return {
    activities: result.items,
    pagination: {
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    },
  };
}
