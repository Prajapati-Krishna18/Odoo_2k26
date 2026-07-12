/**
 * @file    dashboard.repository.ts
 * @desc    Data-access layer for the Dashboard statistics.
 */

import { prisma } from "../../config/prisma.js";

export const getDepartmentCount = () =>
  prisma.department.count({ where: { isDeleted: false } });

export const getEmployeeCounts = async () => {
  const [total, active, inactive] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
  ]);
  return { total, active, inactive };
};

export const getManagerCount = async () => {
  // Find roles that correspond to ASSET_MANAGER or DEPARTMENT_HEAD
  return prisma.user.count({
    where: {
      role: {
        name: { in: ["ASSET_MANAGER", "DEPARTMENT_HEAD"] },
      },
    },
  });
};

export const getActiveUsersTodayCount = () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return prisma.user.count({
    where: {
      lastLogin: {
        gte: startOfToday,
      },
    },
  });
};

export const getRecentActivities = (limit: number = 5) =>
  prisma.activityLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
    },
  });
