import { client } from './client'

export type ResourceType = 'MEETING_ROOM' | 'VEHICLE' | 'EQUIPMENT'
export type ResourceStatus = 'AVAILABLE' | 'MAINTENANCE' | 'INACTIVE'

export interface ResourceItem {
  id: string
  name: string
  type: ResourceType
  status: ResourceStatus
  description?: string
  location?: string
  capacity?: number
  quantity: number
  imageUrl?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
  maintenanceRequests?: any[]
}

export const resourcesApi = {
  async getAll(): Promise<ResourceItem[]> {
    const res = await client.get('/assets')
    return (res as any).data.items || []
  },

  async getById(id: string): Promise<ResourceItem> {
    const res = await client.get(`/assets/${id}`)
    return (res as any).data
  },

  async create(data: Partial<ResourceItem>): Promise<ResourceItem> {
    const res = await client.post('/assets', data)
    return (res as any).data
  },

  async update(id: string, data: Partial<ResourceItem>): Promise<ResourceItem> {
    const res = await client.patch(`/assets/${id}`, data)
    return (res as any).data
  },

  async delete(id: string): Promise<void> {
    await client.delete(`/assets/${id}`)
  },
}
