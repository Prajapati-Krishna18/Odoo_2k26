/**
 * @file    department.service.ts
 * @desc    Business logic for Department module.
 */

import { ApiError } from "../../utils/ApiError.js";
import * as departmentRepo from "./department.repository.js";
import { prisma } from "../../config/prisma.js";
import {
  type CreateDepartmentDTO,
  type UpdateDepartmentDTO,
  type DepartmentQueryDTO,
} from "./department.dto.js";

// ── Service Operations ────────────────────────────────────────

export async function createDepartment(dto: CreateDepartmentDTO) {
  // 1. Unique code check
  const existing = await departmentRepo.findByCode(dto.code);
  if (existing) {
    throw ApiError.conflict(`Department code '${dto.code}' already exists`);
  }

  // 2. Parent department checks
  if (dto.parentDepartmentId) {
    const parent = await departmentRepo.findById(dto.parentDepartmentId);
    if (!parent) {
      throw ApiError.notFound("Parent department not found");
    }
    if (parent.status !== "ACTIVE") {
      throw ApiError.badRequest("Parent department is inactive");
    }
  }

  // 3. Department head check
  if (dto.departmentHeadId) {
    const headUser = await prisma.user.findUnique({
      where: { id: dto.departmentHeadId },
    });
    if (!headUser) {
      throw ApiError.notFound("Department head user not found");
    }
  }

  return departmentRepo.create(dto);
}

export async function getDepartmentDetails(id: string) {
  const department = await departmentRepo.findById(id);
  if (!department) {
    throw ApiError.notFound("Department not found");
  }
  return department;
}

export async function updateDepartment(id: string, dto: UpdateDepartmentDTO) {
  const department = await departmentRepo.findById(id);
  if (!department) {
    throw ApiError.notFound("Department not found");
  }

  // 1. Self-reference check
  if (dto.parentDepartmentId && dto.parentDepartmentId === id) {
    throw ApiError.badRequest("A department cannot be its own parent");
  }

  // 2. Unique code check
  if (dto.code) {
    const existing = await departmentRepo.findByCode(dto.code);
    if (existing && existing.id !== id) {
      throw ApiError.conflict(`Department code '${dto.code}' already exists`);
    }
  }

  // 3. Parent department check
  if (dto.parentDepartmentId) {
    const parent = await departmentRepo.findById(dto.parentDepartmentId);
    if (!parent) {
      throw ApiError.notFound("Parent department not found");
    }
    if (parent.status !== "ACTIVE") {
      throw ApiError.badRequest("Parent department is inactive");
    }
  }

  // 4. Department head check
  if (dto.departmentHeadId) {
    const headUser = await prisma.user.findUnique({
      where: { id: dto.departmentHeadId },
    });
    if (!headUser) {
      throw ApiError.notFound("Department head user not found");
    }
  }

  return departmentRepo.update(id, dto);
}

export async function updateDepartmentStatus(id: string, status: "ACTIVE" | "INACTIVE") {
  const department = await departmentRepo.findById(id);
  if (!department) {
    throw ApiError.notFound("Department not found");
  }

  // If marking inactive, ensure it doesn't leave active child departments dangling? Or just proceed.
  // We will allow deactivation, but validator and business rule checks that inactive departments cannot receive new employees.
  return departmentRepo.updateStatus(id, status);
}

export async function deleteDepartment(id: string) {
  const department = await departmentRepo.findById(id);
  if (!department) {
    throw ApiError.notFound("Department not found");
  }

  // Check if department contains active employees
  const employeeCount = await prisma.user.count({
    where: { departmentId: id, isActive: true },
  });
  if (employeeCount > 0) {
    throw ApiError.badRequest("Cannot delete department with active employees");
  }

  // Check if department has child departments
  const childCount = await prisma.department.count({
    where: { parentDepartmentId: id, isDeleted: false },
  });
  if (childCount > 0) {
    throw ApiError.badRequest("Cannot delete department with active sub-departments");
  }

  return departmentRepo.softDelete(id);
}

export async function listDepartments(query: DepartmentQueryDTO) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const search = query.search;
  const sortBy = query.sortBy ?? "createdAt";
  const sortOrder = query.sortOrder ?? "desc";
  const status = query.status;

  const result = await departmentRepo.list({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    status,
  } as Required<DepartmentQueryDTO>);

  return {
    departments: result.items,
    pagination: {
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    },
  };
}
