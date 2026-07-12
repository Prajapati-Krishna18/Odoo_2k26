/**
 * @file    employee.dto.ts
 * @desc    Data Transfer Objects for the Employee Directory module.
 */

import { type UserResponseDTO } from "../auth/auth.dto.js";

export interface UpdateEmployeeProfileDTO {
  fullName?: string;
  phone?: string;
  profileImage?: string;
  designation?: string;
  joiningDate?: string;
}

export interface EmployeeQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  roleId?: string; // Filter by role (points to static role ID)
  roleName?: string; // Convenience filter by role name
  status?: "ACTIVE" | "INACTIVE";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PromoteEmployeeDTO {
  roleName: "EMPLOYEE" | "DEPARTMENT_HEAD" | "ASSET_MANAGER";
}

export interface TransferEmployeeDTO {
  departmentId: string;
}

export interface EmployeeResponseDTO extends UserResponseDTO {
  employeeCode: string | null;
  departmentId: string | null;
  designation: string | null;
  joiningDate: Date | null;
  department?: {
    id: string;
    name: string;
    code: string;
  } | null;
}
