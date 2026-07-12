/**
 * @file    employee.service.ts
 * @desc    Business logic for Employee Directory module.
 */

import { ApiError } from "../../utils/ApiError.js";
import * as employeeRepo from "./employee.repository.js";
import { prisma } from "../../config/prisma.js";
import {
  type EmployeeQueryDTO,
  type UpdateEmployeeProfileDTO,
  type PromoteEmployeeDTO,
  type TransferEmployeeDTO,
} from "./employee.dto.js";

// ── Helpers ──────────────────────────────────────────────────

/** Generate a unique employee code: EMP-YYYY-XXXX (where YYYY is current year, XXXX is sequential count) */
async function generateEmployeeCode(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.user.count();
  const seq = String(count + 1).padStart(4, "0");
  return `EMP-${year}-${seq}`;
}

// ── Service Operations ────────────────────────────────────────

export async function getEmployeeDetails(id: string) {
  const employee = await employeeRepo.findById(id);
  if (!employee) {
    throw ApiError.notFound("Employee not found");
  }
  return employee;
}

export async function updateEmployeeProfile(id: string, dto: UpdateEmployeeProfileDTO) {
  const employee = await employeeRepo.findById(id);
  if (!employee) {
    throw ApiError.notFound("Employee not found");
  }

  return employeeRepo.updateProfile(id, dto);
}

export async function promoteEmployee(id: string, dto: PromoteEmployeeDTO) {
  const employee = await employeeRepo.findById(id);
  if (!employee) {
    throw ApiError.notFound("Employee not found");
  }

  // Find targeted role ID
  const role = await prisma.role.findUnique({
    where: { name: dto.roleName },
  });
  if (!role) {
    throw ApiError.notFound(`Role '${dto.roleName}' not found`);
  }

  // Execute promotion
  return employeeRepo.updateRole(id, role.id);
}

export async function transferEmployee(id: string, dto: TransferEmployeeDTO) {
  const employee = await employeeRepo.findById(id);
  if (!employee) {
    throw ApiError.notFound("Employee not found");
  }

  // 1. Verify target department exists and is ACTIVE
  const targetDept = await prisma.department.findUnique({
    where: { id: dto.departmentId, isDeleted: false },
  });
  if (!targetDept) {
    throw ApiError.notFound("Target department not found");
  }
  if (targetDept.status !== "ACTIVE") {
    throw ApiError.badRequest("Cannot transfer employee to an INACTIVE department");
  }

  // 2. Perform transfer
  return employeeRepo.updateDepartment(id, dto.departmentId);
}

export async function updateEmployeeStatus(id: string, status: "ACTIVE" | "INACTIVE") {
  const employee = await employeeRepo.findById(id);
  if (!employee) {
    throw ApiError.notFound("Employee not found");
  }

  const isActive = status === "ACTIVE";

  // If activating, assign employeeCode if missing (e.g. for user registered during signup)
  if (isActive && !employee.employeeCode) {
    const code = await generateEmployeeCode();
    await prisma.user.update({
      where: { id },
      data: { employeeCode: code },
    });
  }

  return employeeRepo.updateStatus(id, isActive);
}

export async function listEmployees(query: EmployeeQueryDTO) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const search = query.search;
  const departmentId = query.departmentId;
  const roleId = query.roleId;
  const roleName = query.roleName;
  const status = query.status;
  const sortBy = query.sortBy ?? "createdAt";
  const sortOrder = query.sortOrder ?? "desc";

  const result = await employeeRepo.list({
    page,
    limit,
    search,
    departmentId,
    roleId,
    roleName,
    status,
    sortBy,
    sortOrder,
  } as Required<EmployeeQueryDTO>);

  return {
    employees: result.items,
    pagination: {
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    },
  };
}
