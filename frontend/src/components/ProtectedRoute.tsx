import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth, canAccessRoute, getDefaultRoute } from '@/context/AuthContext'

export function ProtectedRoute() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-void)',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-display)',
        fontSize: '0.85rem'
      }}>
        Initializing session...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (!canAccessRoute(user.role, location.pathname)) {
    return <Navigate to={getDefaultRoute(user.role)} replace />
  }

  return <Outlet />
}
