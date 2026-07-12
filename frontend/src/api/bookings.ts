import { client } from './client'
import { type ResourceItem } from './resources'

export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'

export interface BookingItem {
  id: string
  resourceId: string
  userId: string
  title: string
  description?: string
  startTime: string
  endTime: string
  status: BookingStatus
  rejectedReason?: string
  cancelReason?: string
  attendeeCount?: number
  purpose?: string
  returnCondition?: string
  isExclusive: boolean
  createdAt: string
  updatedAt: string
  resource?: ResourceItem
  user?: {
    id: string
    fullName: string
    email: string
  }
}

export const bookingsApi = {
  async getAll(): Promise<BookingItem[]> {
    const res = await client.get('/bookings')
    return (res as any).data.items || []
  },

  async getById(id: string): Promise<BookingItem> {
    const res = await client.get(`/bookings/${id}`)
    return (res as any).data
  },

  async create(data: Partial<BookingItem>): Promise<BookingItem> {
    const res = await client.post('/bookings', data)
    return (res as any).data
  },

  async update(id: string, data: Partial<BookingItem>): Promise<BookingItem> {
    const res = await client.patch(`/bookings/${id}`, data)
    return (res as any).data
  },

  async cancel(id: string, reason?: string): Promise<BookingItem> {
    const res = await client.put(`/bookings/${id}/cancel`, { reason })
    return (res as any).data
  },

  async approve(id: string): Promise<BookingItem> {
    const res = await client.put(`/bookings/${id}/approve`)
    return (res as any).data
  },

  async reject(id: string, reason?: string): Promise<BookingItem> {
    const res = await client.put(`/bookings/${id}/reject`, { reason })
    return (res as any).data
  },
}
