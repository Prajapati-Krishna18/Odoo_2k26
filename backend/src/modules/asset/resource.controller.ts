/**
 * @file    resource.controller.ts
 */
import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import * as svc from "./resource.service.js";
import { createResourceSchema, updateResourceSchema, resourceQuerySchema } from "./resource.validator.js";

export const createResource = async (req: Request, res: Response): Promise<void> => {
  const p = createResourceSchema.safeParse(req.body);
  if (!p.success) throw ApiError.badRequest("Validation failed", p.error.issues.map(e => ({ field: e.path.join("."), message: e.message })));
  const r = await svc.createResource(p.data);
  res.status(201).json(ApiResponse.created("Resource created", r));
};

export const getResources = async (req: Request, res: Response): Promise<void> => {
  const p = resourceQuerySchema.safeParse(req.query);
  if (!p.success) throw ApiError.badRequest("Invalid query", p.error.issues.map(e => ({ field: e.path.join("."), message: e.message })));
  res.json(ApiResponse.ok("Resources retrieved", await svc.getResources(p.data)));
};

export const getResourceById = async (req: Request, res: Response): Promise<void> => {
  res.json(ApiResponse.ok("Resource retrieved", await svc.getResourceById(req.params.id as string)));
};

export const updateResource = async (req: Request, res: Response): Promise<void> => {
  const p = updateResourceSchema.safeParse(req.body);
  if (!p.success) throw ApiError.badRequest("Validation failed", p.error.issues.map(e => ({ field: e.path.join("."), message: e.message })));
  res.json(ApiResponse.ok("Resource updated", await svc.updateResource(req.params.id as string, p.data)));
};

export const deleteResource = async (req: Request, res: Response): Promise<void> => {
  await svc.deleteResource(req.params.id as string);
  res.json(ApiResponse.ok("Resource deleted", null));
};
