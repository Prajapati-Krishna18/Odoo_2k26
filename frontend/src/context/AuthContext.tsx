import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi, type UserProfile } from '@/api/auth'

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'Admin' | 'Asset Manager' | 'Department Head' | 'Employee'

export interface MockUser {
  id: string
  name: string
  initials: string
  role: UserRole
  notificationCount: number
  email: string
}

const DEFAULT_USER: MockUser = {
  id: '',
  name: 'Priya Sharma',
  initials: 'PS',
  role: 'Admin',
  notificationCount: 3,
  email: '',
}

interface AuthContextValue {
  user: MockUser
  setRole: (role: UserRole) => void
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// Helper to map DB role to UI role
function mapRole(dbRole: string): UserRole {
  switch (dbRole) {
    case 'ADMIN':
      return 'Admin'
    case 'ASSET_MANAGER':
      return 'Asset Manager'
    case 'DEPARTMENT_HEAD':
      return 'Department Head'
    case 'EMPLOYEE':
    default:
      return 'Employee'
  }
}

// Helper to compute initials
function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser>(DEFAULT_USER)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = async () => {
    try {
      const dbUser: UserProfile = await authApi.getMe()
      setUser({
        id: dbUser.id,
        name: dbUser.fullName,
        initials: getInitials(dbUser.fullName),
        role: mapRole(dbUser.role),
        notificationCount: 0, // dynamic notifications will be wired separately
        email: dbUser.email,
      })
      setIsAuthenticated(true)
    } catch (err) {
      // Clear invalid credentials
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(DEFAULT_USER)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      fetchProfile()
    } else {
      setIsLoading(false)
    }
  }, [])

  const setRole = (role: UserRole) => {
    setUser((prev) => ({ ...prev, role }))
  }

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password)
    localStorage.setItem('accessToken', data.tokens.accessToken)
    localStorage.setItem('refreshToken', data.tokens.refreshToken)
    setUser({
      id: data.user.id,
      name: data.user.fullName,
      initials: getInitials(data.user.fullName),
      role: mapRole(data.user.role),
      notificationCount: 0,
      email: data.user.email,
    })
    setIsAuthenticated(true)
  }

  const logout = async () => {
    const refresh = localStorage.getItem('refreshToken')
    if (refresh) {
      try {
        await authApi.logout(refresh)
      } catch (err) {
        console.error('Logout API failed:', err)
      }
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(DEFAULT_USER)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setRole,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export const ALL_ROLES: UserRole[] = [
  'Admin',
  'Asset Manager',
  'Department Head',
  'Employee',
]

/** Route access mapping — which roles can access which paths */
export const ROUTE_ACCESS: Record<string, UserRole[]> = {
  '/dashboard':     ['Admin', 'Asset Manager', 'Department Head', 'Employee'],
  '/org-setup':     ['Admin'],
  '/assets':        ['Admin', 'Asset Manager', 'Department Head', 'Employee'],
  '/allocations':   ['Admin', 'Asset Manager', 'Department Head'],
  '/bookings':      ['Admin', 'Asset Manager', 'Department Head', 'Employee'],
  '/maintenance':   ['Admin', 'Asset Manager'],
  '/audits':        ['Admin', 'Asset Manager'],
  '/reports':       ['Admin', 'Asset Manager', 'Department Head'],
  '/activity':      ['Admin', 'Asset Manager', 'Department Head', 'Employee'],
}

export function canAccessRoute(role: UserRole, path: string): boolean {
  const allowed = ROUTE_ACCESS[path]
  if (!allowed) return false
  return allowed.includes(role)
}

export function getDefaultRoute(_role: UserRole): string {
  return '/dashboard'
}
