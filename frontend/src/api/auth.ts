import { client } from './client'

export interface UserProfile {
  id: string
  fullName: string
  email: string
  phone?: string
  profileImage?: string | null
  role: string
  isActive: boolean
  emailVerified: boolean
  createdAt: string
}

export interface LoginResponse {
  user: UserProfile
  tokens: {
    accessToken: string
    refreshToken: string
  }
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await client.post('/auth/login', { email, password })
    // Res is response.data since client response interceptor returns response.data
    return (res as any).data
  },

  async register(fullName: string, email: string, password: string, phone: string = ''): Promise<UserProfile> {
    const res = await client.post('/auth/register', { fullName, email, password, phone })
    return (res as any).data
  },

  async logout(refreshToken: string): Promise<void> {
    await client.post('/auth/logout', { refreshToken })
  },

  async getMe(): Promise<UserProfile> {
    const res = await client.get('/auth/me')
    return (res as any).data
  },
}
