/**
 * @file    notification.dto.ts
 * @desc    Data Transfer Objects for the Notification module.
 */

export interface CreateNotificationDTO {
  userId: string;
  title: string;
  message: string;
  type?: string;
  bookingId?: string;
  maintenanceRequestId?: string;
}

export interface NotificationQueryDTO {
  page?: number;
  limit?: number;
  isRead?: boolean;
}

export interface NotificationResponseDTO {
  id: string;
  title: string;
  message: string;
  type: string;
  userId: string;
  isRead: boolean;
  createdAt: Date;
}
