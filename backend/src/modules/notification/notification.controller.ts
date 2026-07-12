/**
 * @file    notification.controller.ts
 * @desc    HTTP request handlers for Notification routes.
 */

import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import * as notificationService from "./notification.service.js";
import { notificationQuerySchema } from "./notification.validator.js";

export const list = async (req: Request, res: Response): Promise<void> => {
  const parsed = notificationQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw ApiError.badRequest("Validation failed", errors);
  }

  if (!req.user) {
    throw ApiError.unauthorized("Authentication required");
  }

  const result = await notificationService.getNotifications(req.user.id, parsed.data);
  const response = ApiResponse.ok("Notifications retrieved successfully", result);
  res.status(response.statusCode).json(response);
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  const id = req.params["id"] as string;
  if (!id) {
    throw ApiError.badRequest("Notification ID is required");
  }

  if (!req.user) {
    throw ApiError.unauthorized("Authentication required");
  }

  await notificationService.readNotification(id, req.user.id);
  const response = ApiResponse.ok("Notification marked as read", null);
  res.status(response.statusCode).json(response);
};

export const markAllRead = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required");
  }

  await notificationService.readAllNotifications(req.user.id);
  const response = ApiResponse.ok("All notifications marked as read", null);
  res.status(response.statusCode).json(response);
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = req.params["id"] as string;
  if (!id) {
    throw ApiError.badRequest("Notification ID is required");
  }

  if (!req.user) {
    throw ApiError.unauthorized("Authentication required");
  }

  await notificationService.deleteNotification(id, req.user.id);
  const response = ApiResponse.ok("Notification deleted successfully", null);
  res.status(response.statusCode).json(response);
};
