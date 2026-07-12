/**
 * @file    dashboard.service.ts
 * @desc    Business logic for compiling Dashboard statistics.
 *          Designed with extension hooks for other developers to plug in later.
 */

import * as dashboardRepo from "./dashboard.repository.js";
import { type DashboardStatsDTO } from "./dashboard.dto.js";

export async function getDashboardStats(): Promise<DashboardStatsDTO> {
  const [
    deptCount,
    employeeCounts,
    managerCount,
    activeTodayCount,
    recentLogs,
  ] = await Promise.all([
    dashboardRepo.getDepartmentCount(),
    dashboardRepo.getEmployeeCounts(),
    dashboardRepo.getManagerCount(),
    dashboardRepo.getActiveUsersTodayCount(),
    dashboardRepo.getRecentActivities(5),
  ]);

  const stats: DashboardStatsDTO = {
    totalDepartments: deptCount,
    totalEmployees: employeeCounts.total,
    activeEmployees: employeeCounts.active,
    inactiveEmployees: employeeCounts.inactive,
    totalManagers: managerCount,
    activeUsersToday: activeTodayCount,
    recentActivities: recentLogs,

    // ────────────────────────────────────────────────────────
    // EXTENSION HOOKS FOR OTHER DEVELOPERS (PHASE 5+)
    // ────────────────────────────────────────────────────────
    
    // TODO: Plug in Asset counts here later (e.g. total, available, allocated)
    assets: {
      totalAssets: 0,
      availableAssets: 0,
      allocatedAssets: 0,
      underMaintenanceAssets: 0,
    },

    // TODO: Plug in Booking stats here later
    bookings: {
      totalBookings: 0,
      pendingBookings: 0,
      approvedBookings: 0,
    },

    // TODO: Plug in Maintenance tickets here later
    maintenance: {
      totalTickets: 0,
      openTickets: 0,
      resolvedTickets: 0,
    },
  };

  return stats;
}
