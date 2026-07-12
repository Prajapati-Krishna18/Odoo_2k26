/**
 * @file    activity.repository.ts
 * @desc    Data-access layer for the ActivityLog entity.
 */

import { prisma } from "../../config/prisma.js";
import { type CreateActivityLogDTO, type ActivityQueryDTO } from "./activity.dto.js";

export const create = (data: CreateActivityLogDTO) =>
  prisma.activityLog.create({
    data: {
      userId: data.userId,
      action: data.action,
      module: data.module,
      entityId: data.entityId,
      description: data.description,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    },
  });

export const list = async (query: Required<ActivityQueryDTO>) => {
  const where: any = {};

  if (query.userId) {
    where.userId = query.userId;
  }

  if (query.module) {
    where.module = query.module;
  }

  if (query.action) {
    where.action = query.action;
  }

  if (query.search) {
    where.OR = [
      { description: { contains: query.search, mode: "insensitive" } },
      { action: { contains: query.search, mode: "insensitive" } },
      { module: { contains: query.search, mode: "insensitive" } },
      { user: { fullName: { contains: query.search, mode: "insensitive" } } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.activityLog.count({ where }),
    prisma.activityLog.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { [query.sortBy]: query.sortOrder },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    }),
  ]);

  return { total, items };
};
