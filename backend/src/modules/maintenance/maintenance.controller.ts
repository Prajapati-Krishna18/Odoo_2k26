/**
 * @file    maintenance.controller.ts
 */
import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import * as svc from "./maintenance.service.js";
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  approveMaintenanceSchema,
  rejectMaintenanceSchema,
  maintenanceQuerySchema,
} from "./maintenance.validator.js";

export const createMaintenanceRequest = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();
  console.log("DEBUG: createMaintenanceRequest body:", req.body);
  const p = createMaintenanceSchema.safeParse(req.body);
  if (!p.success) {
    console.error("DEBUG: createMaintenanceRequest validation failed:", p.error.format());
    throw ApiError.badRequest("Validation failed", p.error.issues.map(e => ({ field: e.path.join("."), message: e.message })));
  }
  const reqObj = await svc.createMaintenanceRequest(req.user.id, p.data);
  res.status(201).json(ApiResponse.created("Maintenance request created", reqObj));
};

export const getMaintenanceRequests = async (req: Request, res: Response): Promise<void> => {
  const p = maintenanceQuerySchema.safeParse(req.query);
  if (!p.success) throw ApiError.badRequest("Invalid query", p.error.issues.map(e => ({ field: e.path.join("."), message: e.message })));
  res.json(ApiResponse.ok("Maintenance requests retrieved", await svc.getMaintenanceRequests(p.data)));
};

export const getMaintenanceById = async (req: Request, res: Response): Promise<void> => {
  res.json(ApiResponse.ok("Maintenance request retrieved", await svc.getMaintenanceById(req.params.id as string)));
};

export const updateMaintenanceRequest = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();
  const p = updateMaintenanceSchema.safeParse(req.body);
  if (!p.success) throw ApiError.badRequest("Validation failed", p.error.issues.map(e => ({ field: e.path.join("."), message: e.message })));
  res.json(ApiResponse.ok("Maintenance request updated", await svc.updateMaintenanceRequest(req.params.id as string, req.user.id, req.user.role, p.data)));
};

export const approveMaintenanceRequest = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();
  const p = approveMaintenanceSchema.safeParse(req.body);
  if (!p.success) throw ApiError.badRequest("Validation failed", p.error.issues.map(e => ({ field: e.path.join("."), message: e.message })));
  res.json(ApiResponse.ok("Maintenance request approved", await svc.approveMaintenanceRequest(req.params.id as string, req.user.id, p.data)));
};

export const rejectMaintenanceRequest = async (req: Request, res: Response): Promise<void> => {
  const p = rejectMaintenanceSchema.safeParse(req.body);
  if (!p.success) throw ApiError.badRequest("Validation failed", p.error.issues.map(e => ({ field: e.path.join("."), message: e.message })));
  res.json(ApiResponse.ok("Maintenance request rejected", await svc.rejectMaintenanceRequest(req.params.id as string, p.data)));
};

export const startMaintenanceRequest = async (req: Request, res: Response): Promise<void> => {
  res.json(ApiResponse.ok("Maintenance started", await svc.startMaintenanceRequest(req.params.id as string)));
};

export const completeMaintenanceRequest = async (req: Request, res: Response): Promise<void> => {
  res.json(ApiResponse.ok("Maintenance completed", await svc.completeMaintenanceRequest(req.params.id as string)));
};

export const cancelMaintenanceRequest = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();
  res.json(ApiResponse.ok("Maintenance request cancelled", await svc.cancelMaintenanceRequest(req.params.id as string, req.user.id, req.user.role)));
};
