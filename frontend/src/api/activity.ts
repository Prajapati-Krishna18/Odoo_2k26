import { client } from './client'

export interface NotificationItem {
  id: string
  userId: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

export interface ActivityLogItem {
  id: string
  userId: string
  action: string
  module: string
  entityId?: string
  description: string
  createdAt: string
  user: {
    fullName: string
    role: {
      name: string
    }
  }
}

export const activityApi = {
  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await client.get('/notifications')
    return (res as any).data
  },

  async markNotificationRead(id: string): Promise<void> {
    await client.patch(`/notifications/${id}/read`)
  },

  async markAllNotificationsRead(): Promise<void> {
    await client.put('/notifications/read-all')
  },

  // Activities
  async getActivities(): Promise<ActivityLogItem[]> {
    const res = await client.get('/activities')
    return (res as any).data
  },
}
