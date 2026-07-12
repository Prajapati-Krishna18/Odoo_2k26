import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { AppShell } from '@/layouts/AppShell'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import LoginPage from '@/pages/Login/LoginPage'
import SignupPage from '@/pages/Login/SignupPage'
import ForgotPasswordPage from '@/pages/Login/ForgotPasswordPage'
import {
  DashboardPage,
  OrgSetupPage,
  AssetDirectoryPage,
  AllocationsPage,
  BookingsPage,
  MaintenancePage,
  AuditsPage,
  ReportsPage,
  ActivityPage,
  StateRailTestPage,
} from '@/pages'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public auth routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected app shell */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/org-setup" element={<OrgSetupPage />} />
              <Route path="/assets" element={<AssetDirectoryPage />} />
              <Route path="/allocations" element={<AllocationsPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/audits" element={<AuditsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/state-rail-test" element={<StateRailTestPage />} />
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
