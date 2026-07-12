/**
 * @file    dashboard.dto.ts
 * @desc    Data Transfer Objects for the Dashboard module.
 */

import { type ActivityResponseDTO } from "../activity/activity.dto.js";

export interface DashboardStatsDTO {
  totalDepartments: number;
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  totalManagers: number;
  activeUsersToday: number;
  recentActivities: ActivityResponseDTO[];

  // Extensible fields for other developers to plug in later:
  assets?: {
    totalAssets: number;
    availableAssets: number;
    allocatedAssets: number;
    underMaintenanceAssets: number;
  };
  bookings?: {
    totalBookings: number;
    pendingBookings: number;
    approvedBookings: number;
  };
  maintenance?: {
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
  };
}
