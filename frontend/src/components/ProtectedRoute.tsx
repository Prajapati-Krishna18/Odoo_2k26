import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  
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
  return <Outlet />
}
