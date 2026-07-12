/**
 * @file    department.dto.ts
 * @desc    Data Transfer Objects for the Department module.
 */

export interface CreateDepartmentDTO {
  name: string;
  code: string;
  description?: string;
  parentDepartmentId?: string;
  departmentHeadId?: string;
}

export interface UpdateDepartmentDTO {
  name?: string;
  code?: string;
  description?: string;
  parentDepartmentId?: string;
  departmentHeadId?: string;
}

export interface DepartmentQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: "ACTIVE" | "INACTIVE";
}

export interface DepartmentResponseDTO {
  id: string;
  name: string;
  code: string;
  description: string | null;
  parentDepartmentId: string | null;
  departmentHeadId: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
  parentDepartment?: {
    id: string;
    name: string;
    code: string;
  } | null;
  departmentHead?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  _count?: {
    childDepartments: number;
    employees: number;
  };
}
