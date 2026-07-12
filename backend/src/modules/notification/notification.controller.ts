import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import * as svc from "./notification.service.js";
import { z } from "zod";

const pageQ = z.object({ page: z.string().transform(Number).default(1), limit: z.string().transform(Number).default(20) });

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();
  const { page, limit } = pageQ.parse(req.query);
  res.json(ApiResponse.ok("Notifications retrieved", await svc.getNotifications(req.user.id, page, limit)));
};

export const markRead = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();
  res.json(ApiResponse.ok("Notification marked as read", await svc.markRead(req.params.id as string, req.user.id)));
};

export const markAllRead = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();
  await svc.markAllRead(req.user.id);
  res.json(ApiResponse.ok("All notifications marked as read", null));
};

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();
  await svc.deleteNotification(req.params.id as string, req.user.id);
  res.json(ApiResponse.ok("Notification deleted", null));
};
