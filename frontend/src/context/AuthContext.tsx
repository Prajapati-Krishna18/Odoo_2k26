import { createContext, useContext, useState, type ReactNode } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'Admin' | 'Asset Manager' | 'Department Head' | 'Employee'

export interface MockUser {
  name: string
  initials: string
  role: UserRole
  notificationCount: number
}

interface AuthContextValue {
  user: MockUser
  setRole: (role: UserRole) => void
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

const DEFAULT_USER: MockUser = {
  name: 'Priya Sharma',
  initials: 'PS',
  role: 'Admin',
  notificationCount: 3,
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser>(DEFAULT_USER)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const setRole = (role: UserRole) => {
    setUser((prev) => ({ ...prev, role }))
  }

  const login = () => setIsAuthenticated(true)
  const logout = () => setIsAuthenticated(false)

  return (
    <AuthContext.Provider value={{ user, setRole, isAuthenticated, login, logout }}>
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

/** All available roles for the role switcher UI */
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
