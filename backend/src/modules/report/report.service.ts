/**
 * @file    report.service.ts
 * @desc    Business logic for report generations, statistics,
 *          and custom provider compilations.
 */

import { prisma } from "../../config/prisma.js";
import { StatsRegistry, ReportRegistry } from "../integration/integration.service.js";
import { type ReportSummaryDTO, type ReportResponseDTO } from "./report.dto.js";
import { ApiError } from "../../utils/ApiError.js";

export async function getSummaryStats(userId: string): Promise<ReportSummaryDTO> {
  const [
    totalDepts,
    totalUsers,
    activeUsers,
    inactiveUsers,
    departments,
    roles,
  ] = await Promise.all([
    prisma.department.count({ where: { isDeleted: false } }),
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
    prisma.department.findMany({
      where: { isDeleted: false },
      include: { _count: { select: { employees: true } } },
    }),
    prisma.role.findMany({
      include: { _count: { select: { users: true } } },
    }),
  ]);

  // Format department distribution
  const departmentWiseEmployees: Record<string, number> = {};
  departments.forEach((dept) => {
    departmentWiseEmployees[dept.name] = dept._count.employees;
  });

  // Format role distribution
  const roleDistribution: Record<string, number> = {};
  roles.forEach((role) => {
    roleDistribution[role.name] = role._count.users;
  });

  // Fetch registered stats from integrated modules (Assets, Bookings, etc. if registered)
  const externalStats = await StatsRegistry.compileAll();

  return {
    totalDepartments: totalDepts,
    totalEmployees: totalUsers,
    activeEmployees: activeUsers,
    inactiveEmployees: inactiveUsers,
    departmentWiseEmployees,
    roleDistribution,

    // Extensible placeholders merged dynamically from integration layer
    assets: externalStats["assets"] || {
      totalAssets: 0,
      availableAssets: 0,
      allocatedAssets: 0,
      underMaintenanceAssets: 0,
    },
    bookings: externalStats["bookings"] || {
      totalBookings: 0,
      pendingBookings: 0,
      approvedBookings: 0,
    },
    maintenance: externalStats["maintenance"] || {
      totalTickets: 0,
      openTickets: 0,
      resolvedTickets: 0,
    },
  };
}

export async function generateCustomReport(
  providerName: string,
  filters: Record<string, any>,
  userName: string
): Promise<ReportResponseDTO> {
  const provider = ReportRegistry.getProvider(providerName);
  if (!provider) {
    throw ApiError.notFound(`Report provider '${providerName}' is not registered`);
  }

  const rawData = await provider.generate(filters);

  return {
    summary: rawData.summary,
    charts: rawData.charts,
    tables: {
      default: rawData.tables,
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      generatedBy: userName,
      filters,
    },
  };
}

export function getRegisteredReportProviders() {
  return ReportRegistry.getProviders().map((p) => ({
    name: p.name,
    title: p.title,
    description: p.description,
  }));
}
