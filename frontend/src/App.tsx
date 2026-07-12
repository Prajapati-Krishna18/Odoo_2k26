import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import {
  ArrowLeftRight,
  CalendarClock,
  Wrench,
  ClipboardCheck,
  BarChart3,
  History,
} from 'lucide-react'
import { AuthProvider } from '@/context/AuthContext'
import { AppShell } from '@/layouts/AppShell'
import {
  DashboardPage,
  OrgSetupPage,
  AssetDirectoryPage,
  StateRailTestPage,
  PlaceholderPage,
} from '@/pages'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Main App Layout Shell */}
          <Route element={<AppShell />}>
            {/* Primary Routes */}
            <Route path="/" element={<DashboardPage />} />
            <Route path="/org-setup" element={<OrgSetupPage />} />
            <Route path="/assets" element={<AssetDirectoryPage />} />
            
            {/* Placeholders */}
            <Route
              path="/allocations"
              element={
                <PlaceholderPage
                  title="Allocation & Transfer"
                  icon={ArrowLeftRight}
                  description="Onboard logistics pipelines to assign assets to employees, transfer custody across sites, and manage compliance signoffs."
                />
              }
            />
            <Route
              path="/bookings"
              element={
                <PlaceholderPage
                  title="Resource Booking"
                  icon={CalendarClock}
                  description="Temporary checkout scheduler for hardware equipment kits, drones, and test lab devices."
                />
              }
            />
            <Route
              path="/maintenance"
              element={
                <PlaceholderPage
                  title="Maintenance Log"
                  icon={Wrench}
                  description="Track calibration logs, device diagnostic metrics, service requests, and hardware component repairs."
                />
              }
            />
            <Route
              path="/audits"
              element={
                <PlaceholderPage
                  title="Inventory Audits"
                  icon={ClipboardCheck}
                  description="Verify device custody compliance using physical scan integrations, flag inventory discrepancies, and reconcile differences."
                />
              }
            />
            <Route
              path="/reports"
              element={
                <PlaceholderPage
                  title="Analytics Reports"
                  icon={BarChart3}
                  description="Fleet efficiency indices, lifecycle cost calculations, warranty expiration calendars, and return compliance analytics."
                />
              }
            />
            <Route
              path="/activity"
              element={
                <PlaceholderPage
                  title="Global Activity Logs"
                  icon={History}
                  description="System-wide audit trail of asset transactions, allocation modifications, role assignments, and dispatch compliance history."
                />
              }
            />

            {/* Showcase StateRail review page inside AppShell for previewing */}
            <Route path="/state-rail-test" element={<StateRailTestPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
