import { client } from './client'

export interface DepartmentItem {
  id: string
  name: string
  code?: string
  departmentHeadId?: string
  parentDepartmentId?: string
  headId?: string
  headName?: string
  parentDept?: string
  status?: string
  _count?: {
    users?: number
  }
}

export interface CategoryItem {
  id: string
  name: string
  customFields?: Array<{ key: string; value: string }>
}

export interface EmployeeItem {
  id: string
  fullName: string
  email: string
  role: string
  status: string
  departmentId?: string
  department?: {
    id: string
    name: string
  }
}

export const orgApi = {
  // Departments
  async getDepartments(): Promise<DepartmentItem[]> {
    const res = await client.get('/departments')
    return (res as any).data.departments || []
  },

  async createDepartment(data: Partial<DepartmentItem>): Promise<DepartmentItem> {
    const res = await client.post('/departments', data)
    return (res as any).data
  },

  // Categories
  async getCategories(): Promise<CategoryItem[]> {
    const res = await client.get('/categories')
    return (res as any).data.categories || []
  },

  async createCategory(data: Partial<CategoryItem>): Promise<CategoryItem> {
    const res = await client.post('/categories', data)
    return (res as any).data
  },

  async getEmployees(): Promise<EmployeeItem[]> {
    const res = await client.get('/employees')
    return (res as any).data.employees || []
  },

  async promoteEmployee(id: string, role: string): Promise<EmployeeItem> {
    const res = await client.patch(`/employees/${id}/role`, { role })
    return (res as any).data
  },
}
