/**
 * @file    department.repository.ts
 * @desc    Data-access layer for Department entity.
 */

import { prisma } from "../../config/prisma.js";
import { type CreateDepartmentDTO, type UpdateDepartmentDTO, type DepartmentQueryDTO } from "./department.dto.js";

// ── Queries ──────────────────────────────────────────────────

export const findById = (id: string) =>
  prisma.department.findUnique({
    where: { id, isDeleted: false },
    include: {
      parentDepartment: { select: { id: true, name: true, code: true } },
      departmentHead: { select: { id: true, fullName: true, email: true } },
      _count: { select: { childDepartments: true, employees: true } },
    },
  });

export const findByCode = (code: string) =>
  prisma.department.findUnique({
    where: { code, isDeleted: false },
  });

export const create = (data: CreateDepartmentDTO) =>
  prisma.department.create({
    data: {
      name: data.name,
      code: data.code,
      description: data.description,
      parentDepartmentId: data.parentDepartmentId,
      departmentHeadId: data.departmentHeadId,
    },
  });

export const update = (id: string, data: UpdateDepartmentDTO) =>
  prisma.department.update({
    where: { id },
    data,
  });

export const updateStatus = (id: string, status: "ACTIVE" | "INACTIVE") =>
  prisma.department.update({
    where: { id },
    data: { status },
  });

export const softDelete = (id: string) =>
  prisma.department.update({
    where: { id },
    data: { isDeleted: true },
  });

export const list = async (query: Required<DepartmentQueryDTO>) => {
  const where: any = { isDeleted: false };

  if (query.status) {
    where.status = query.status;
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { code: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.department.count({ where }),
    prisma.department.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { [query.sortBy]: query.sortOrder },
      include: {
        parentDepartment: { select: { id: true, name: true, code: true } },
        departmentHead: { select: { id: true, fullName: true, email: true } },
      },
    }),
  ]);

  return { total, items };
};
