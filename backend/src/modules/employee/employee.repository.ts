/**
 * @file    employee.repository.ts
 * @desc    Data-access layer for Employee Directory (User entity additions).
 */

import { prisma } from "../../config/prisma.js";
import { type EmployeeQueryDTO, type UpdateEmployeeProfileDTO } from "./employee.dto.js";

// ── Queries ──────────────────────────────────────────────────

export const findById = (id: string) =>
  prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
      department: { select: { id: true, name: true, code: true } },
    },
  });

export const updateProfile = (id: string, data: UpdateEmployeeProfileDTO) =>
  prisma.user.update({
    where: { id },
    data: {
      fullName: data.fullName,
      phone: data.phone,
      profileImage: data.profileImage,
      designation: data.designation,
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
    },
    include: {
      role: true,
      department: { select: { id: true, name: true, code: true } },
    },
  });

export const updateRole = (id: string, roleId: string) =>
  prisma.user.update({
    where: { id },
    data: { roleId },
    include: {
      role: true,
      department: { select: { id: true, name: true, code: true } },
    },
  });

export const updateDepartment = (id: string, departmentId: string) =>
  prisma.user.update({
    where: { id },
    data: { departmentId },
    include: {
      role: true,
      department: { select: { id: true, name: true, code: true } },
    },
  });

export const updateStatus = (id: string, isActive: boolean) =>
  prisma.user.update({
    where: { id },
    data: { isActive },
    include: {
      role: true,
      department: { select: { id: true, name: true, code: true } },
    },
  });

export const list = async (query: Required<EmployeeQueryDTO>) => {
  const where: any = {};

  if (query.departmentId) {
    where.departmentId = query.departmentId;
  }

  if (query.status) {
    where.isActive = query.status === "ACTIVE";
  }

  if (query.roleId) {
    where.roleId = query.roleId;
  }

  if (query.roleName) {
    where.role = { name: query.roleName };
  }

  if (query.search) {
    where.OR = [
      { fullName: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
      { employeeCode: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { [query.sortBy]: query.sortOrder },
      include: {
        role: true,
        department: { select: { id: true, name: true, code: true } },
      },
    }),
  ]);

  return { total, items };
};
