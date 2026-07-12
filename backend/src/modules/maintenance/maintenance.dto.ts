/**
 * @file    maintenance.dto.ts
 */
import { MaintenanceStatus, Priority } from "@prisma/client";

export interface CreateMaintenanceDTO {
  resourceId: string;
  title: string;
  description: string;
  priority?: Priority;
}

export interface UpdateMaintenanceDTO {
  title?: string;
  description?: string;
  priority?: Priority;
}

export interface ApproveMaintenanceDTO {
  scheduledStart: Date;
  scheduledEnd: Date;
}

export interface RejectMaintenanceDTO {
  rejectedReason: string;
}
