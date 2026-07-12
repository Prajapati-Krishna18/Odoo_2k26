/**
 * @file    resource.repository.ts
 */
import { prisma } from "../../config/prisma.js";
import { ResourceType, ResourceStatus } from "@prisma/client";

export const createResource = (data: {
  name: string; type: ResourceType; description?: string;
  location?: string; capacity?: number; quantity?: number;
  imageUrl?: string; metadata?: Record<string, unknown>;
}) => prisma.resource.create({
  data: {
    ...data,
    metadata: data.metadata as any,
  }
});

export const findResources = (opts: {
  type?: ResourceType; status?: ResourceStatus; skip?: number; take?: number;
}) =>
  prisma.resource.findMany({
    where: {
      ...(opts.type ? { type: opts.type } : {}),
      ...(opts.status ? { status: opts.status } : {}),
    },
    orderBy: { createdAt: "desc" },
    skip: opts.skip, take: opts.take,
  });

export const countResources = (opts: { type?: ResourceType; status?: ResourceStatus }) =>
  prisma.resource.count({ where: { ...(opts.type ? { type: opts.type } : {}), ...(opts.status ? { status: opts.status } : {}) } });

export const findResourceById = (id: string) =>
  prisma.resource.findUnique({ where: { id } });

export const updateResource = (id: string, data: Record<string, unknown>) =>
  prisma.resource.update({
    where: { id },
    data: {
      ...data,
      metadata: data.metadata !== undefined ? data.metadata as any : undefined,
    }
  });

export const deleteResource = (id: string) =>
  prisma.resource.delete({ where: { id } });
