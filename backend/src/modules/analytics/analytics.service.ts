/**
 * @file    analytics.service.ts
 * @desc    Business logic for trend growth calculations, date ranges,
 *          and analytical data compiling.
 */

import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";

// ── Helpers ──────────────────────────────────────────────────

function getDateRangeOffsets(cycle: "weekly" | "monthly" | "yearly" | "custom", start?: string, end?: string) {
  let currentStart = new Date();
  let currentEnd = new Date();
  let durationMs = 0;

  if (cycle === "weekly") {
    durationMs = 7 * 24 * 60 * 60 * 1000;
    currentStart = new Date(currentEnd.getTime() - durationMs);
  } else if (cycle === "monthly") {
    durationMs = 30 * 24 * 60 * 60 * 1000;
    currentStart = new Date(currentEnd.getTime() - durationMs);
  } else if (cycle === "yearly") {
    durationMs = 365 * 24 * 60 * 60 * 1000;
    currentStart = new Date(currentEnd.getTime() - durationMs);
  } else {
    // Custom range
    if (!start || !end) {
      throw ApiError.badRequest("Start and end dates are required for custom cycle query");
    }
    currentStart = new Date(start);
    currentEnd = new Date(end);
    durationMs = currentEnd.getTime() - currentStart.getTime();

    if (durationMs <= 0) {
      throw ApiError.badRequest("Start date must be before end date");
    }
  }

  // Preceding cycle of identical duration
  const previousStart = new Date(currentStart.getTime() - durationMs);
  const previousEnd = new Date(currentStart.getTime());

  return {
    current: { start: currentStart, end: currentEnd },
    previous: { start: previousStart, end: previousEnd },
    durationMs,
  };
}

function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return parseFloat((((current - previous) / previous) * 100).toFixed(2));
}

// ── Service Operations ────────────────────────────────────────

export async function getAnalyticsTrends(
  cycle: "weekly" | "monthly" | "yearly" | "custom",
  startDate?: string,
  endDate?: string
) {
  const ranges = getDateRangeOffsets(cycle, startDate, endDate);

  // 1. Employee growth trends (User signups)
  const [currentEmployees, previousEmployees] = await Promise.all([
    prisma.user.count({
      where: {
        createdAt: {
          gte: ranges.current.start,
          lte: ranges.current.end,
        },
      },
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: ranges.previous.start,
          lte: ranges.previous.end,
        },
      },
    }),
  ]);

  // 2. System Activity growth trends (Audit logs)
  const [currentLogs, previousLogs] = await Promise.all([
    prisma.activityLog.count({
      where: {
        createdAt: {
          gte: ranges.current.start,
          lte: ranges.current.end,
        },
      },
    }),
    prisma.activityLog.count({
      where: {
        createdAt: {
          gte: ranges.previous.start,
          lte: ranges.previous.end,
        },
      },
    }),
  ]);

  // 3. Department additions
  const [currentDepts, previousDepts] = await Promise.all([
    prisma.department.count({
      where: {
        isDeleted: false,
        createdAt: {
          gte: ranges.current.start,
          lte: ranges.current.end,
        },
      },
    }),
    prisma.department.count({
      where: {
        isDeleted: false,
        createdAt: {
          gte: ranges.previous.start,
          lte: ranges.previous.end,
        },
      },
    }),
  ]);

  // 4. Generate daily chart plot points for current cycle
  const dayStep = 24 * 60 * 60 * 1000;
  const chartLabels: string[] = [];
  const chartDataPoints: number[] = [];

  let stepStart = ranges.current.start.getTime();
  const stepEnd = ranges.current.end.getTime();

  while (stepStart <= stepEnd) {
    const dayDate = new Date(stepStart);
    const dayLabel = dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    chartLabels.push(dayLabel);

    // Count user signups on this specific day (mock helper aggregation)
    const nextDay = new Date(stepStart + dayStep);
    const count = await prisma.user.count({
      where: {
        createdAt: {
          gte: dayDate,
          lt: nextDay,
        },
      },
    });
    chartDataPoints.push(count);

    stepStart += dayStep;
    // Cap safety loop for giant intervals
    if (chartLabels.length > 50) break;
  }

  return {
    summary: {
      employees: {
        count: currentEmployees,
        previousCount: previousEmployees,
        growthPercentage: calculateGrowth(currentEmployees, previousEmployees),
      },
      activities: {
        count: currentLogs,
        previousCount: previousLogs,
        growthPercentage: calculateGrowth(currentLogs, previousLogs),
      },
      departments: {
        count: currentDepts,
        previousCount: previousDepts,
        growthPercentage: calculateGrowth(currentDepts, previousDepts),
      },
    },
    charts: {
      userSignups: {
        labels: chartLabels,
        data: chartDataPoints,
      },
    },
    metadata: {
      cycle,
      range: {
        start: ranges.current.start.toISOString(),
        end: ranges.current.end.toISOString(),
      },
    },
  };
}
