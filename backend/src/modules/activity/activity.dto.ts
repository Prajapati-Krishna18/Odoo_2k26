/**
 * @file    activity.dto.ts
 * @desc    Data Transfer Objects for the Activity Log module.
 */

export interface CreateActivityLogDTO {
  userId: string;
  action: string;
  module: string;
  entityId?: string | null;
  description: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface ActivityQueryDTO {
  page?: number;
  limit?: number;
  userId?: string;
  module?: string;
  action?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ActivityResponseDTO {
  id: string;
  userId: string;
  action: string;
  module: string;
  entityId: string | null;
  description: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  user?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}
