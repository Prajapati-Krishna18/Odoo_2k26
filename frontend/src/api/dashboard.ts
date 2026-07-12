import { client } from './client'

export interface DashboardStats {
  totalDepartments: number
  totalEmployees: number
  activeEmployees: number
  inactiveEmployees: number
  totalManagers: number
  activeUsersToday: number
  recentActivities: Array<{
    id: string
    action: string
    module: string
    description: string
    createdAt: string
    user: {
      id: string
      fullName: string
      email: string
    }
  }>
  assets: {
    totalAssets: number
    availableAssets: number
    allocatedAssets: number
    underMaintenanceAssets: number
  }
  bookings: {
    totalBookings: number
    pendingBookings: number
    approvedBookings: number
  }
  maintenance: {
    totalTickets: number
    openTickets: number
    resolvedTickets: number
  }
}

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const res = await client.get('/dashboard')
    return (res as any).data
  },
}
