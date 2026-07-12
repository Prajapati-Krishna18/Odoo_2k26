import { client } from './client'
import { type ResourceItem } from './resources'

export type MaintenanceStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface MaintenanceRequestItem {
  id: string
  resourceId: string
  requestedById: string
  approvedById?: string
  title: string
  description: string
  priority: MaintenancePriority
  status: MaintenanceStatus
  scheduledStart?: string
  scheduledEnd?: string
  startedAt?: string
  completedAt?: string
  rejectedReason?: string
  createdAt: string
  updatedAt: string
  resource?: ResourceItem
  requestedBy?: {
    id: string
    fullName: string
    email: string
  }
}

export const maintenanceApi = {
  async getAll(): Promise<MaintenanceRequestItem[]> {
    const res = await client.get('/maintenance')
    return (res as any).data
  },

  async getById(id: string): Promise<MaintenanceRequestItem> {
    const res = await client.get(`/maintenance/${id}`)
    return (res as any).data
  },

  async create(data: Partial<MaintenanceRequestItem>): Promise<MaintenanceRequestItem> {
    const res = await client.post('/maintenance', data)
    return (res as any).data
  },

  async update(id: string, data: Partial<MaintenanceRequestItem>): Promise<MaintenanceRequestItem> {
    const res = await client.patch(`/maintenance/${id}`, data)
    return (res as any).data
  },

  async approve(id: string): Promise<MaintenanceRequestItem> {
    const res = await client.put(`/maintenance/${id}/approve`)
    return (res as any).data
  },

  async reject(id: string, reason?: string): Promise<MaintenanceRequestItem> {
    const res = await client.put(`/maintenance/${id}/reject`, { reason })
    return (res as any).data
  },

  async start(id: string): Promise<MaintenanceRequestItem> {
    const res = await client.put(`/maintenance/${id}/start`)
    return (res as any).data
  },

  async complete(id: string): Promise<MaintenanceRequestItem> {
    const res = await client.put(`/maintenance/${id}/complete`)
    return (res as any).data
  },

  async cancel(id: string): Promise<MaintenanceRequestItem> {
    const res = await client.put(`/maintenance/${id}/cancel`)
    return (res as any).data
  },
}
