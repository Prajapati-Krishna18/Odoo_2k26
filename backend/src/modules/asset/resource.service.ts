/**
 * @file    resource.service.ts
 */
import { ApiError } from "../../utils/ApiError.js";
import * as repo from "./resource.repository.js";
import type { CreateResourceDTO, UpdateResourceDTO } from "./resource.dto.js";
import { ResourceType, ResourceStatus } from "@prisma/client";

export async function createResource(dto: CreateResourceDTO) {
  return repo.createResource({ ...dto, quantity: dto.quantity ?? 1 });
}

export async function getResources(q: { type?: string; status?: string; page?: number; limit?: number }) {
  const page = q.page ?? 1; const limit = q.limit ?? 20; const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    repo.findResources({ type: q.type as ResourceType, status: q.status as ResourceStatus, skip, take: limit }),
    repo.countResources({ type: q.type as ResourceType, status: q.status as ResourceStatus }),
  ]);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getResourceById(id: string) {
  const r = await repo.findResourceById(id);
  if (!r) throw ApiError.notFound("Resource not found");
  return r;
}

export async function updateResource(id: string, dto: UpdateResourceDTO) {
  await getResourceById(id);
  return repo.updateResource(id, dto as Record<string, unknown>);
}

export async function deleteResource(id: string) {
  await getResourceById(id);
  return repo.deleteResource(id);
}
