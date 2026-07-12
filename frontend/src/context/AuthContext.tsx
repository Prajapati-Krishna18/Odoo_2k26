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

  const setRole = (role: UserRole) => {
    setUser((prev) => ({ ...prev, role }))
  }

  return (
    <AuthContext.Provider value={{ user, setRole }}>
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
