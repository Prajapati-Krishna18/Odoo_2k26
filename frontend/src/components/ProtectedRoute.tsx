import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth, canAccessRoute, getDefaultRoute } from '@/context/AuthContext'

export function ProtectedRoute() {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (!canAccessRoute(user.role, location.pathname)) {
    return <Navigate to={getDefaultRoute(user.role)} replace />
  }

  return <Outlet />
}
