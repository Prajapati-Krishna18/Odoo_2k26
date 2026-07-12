import { useState, useEffect } from 'react'
import {
  Boxes,
  UserCheck,
  Wrench,
  CalendarClock,
  ArrowLeftRight,
  Clock,
  AlertTriangle,
  PlusCircle,
  CalendarPlus,
  ArrowUpRight,
} from 'lucide-react'
import { colors } from '@/lib/tokens'
import { dashboardApi, type DashboardStats } from '@/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OverdueItem {
  id: string
  tag: string
  name: string
  holder: string
  dept: string
  daysOverdue: number
}

interface ActivityItem {
  id: string
  type: 'assignment' | 'maintenance' | 'booking' | 'transfer' | 'audit' | string
  title: string
  description: string
  time: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_OVERDUE: OverdueItem[] = [
  { id: '1', tag: 'AST-9021', name: 'MacBook Pro 14"', holder: 'Aarav Mehta', dept: 'Engineering', daysOverdue: 14 },
  { id: '2', tag: 'AST-3304', name: 'iPad Pro 11"', holder: 'Neha Gupta', dept: 'Marketing', daysOverdue: 7 },
  { id: '3', tag: 'AST-8812', name: 'DJI Mavic 3 Drone', holder: 'Vikram Singh', dept: 'Creative', daysOverdue: 5 },
]

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [overdueItems] = useState<OverdueItem[]>(MOCK_OVERDUE)

  useEffect(() => {
    dashboardApi.getStats()
      .then((data) => {
        setStats(data)
      })
      .catch((err) => {
        console.error('Failed to load dashboard stats:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // Handlers for mock CTAs
  const handleAction = (actionName: string) => {
    alert(`Triggered Action: ${actionName} (API endpoint ready for integration)`)
  }

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: '0.85rem' }}>
        Loading dashboard metrics...
      </div>
    )
  }

  // Fallback to defaults if backend values are empty/null
  const availableCount = stats?.assets.availableAssets || 0
  const allocatedCount = stats?.assets.allocatedAssets || 0
  const maintenanceCount = stats?.maintenance.openTickets || stats?.assets.underMaintenanceAssets || 0
  const bookingsCount = stats?.bookings.totalBookings || 0
  const totalEmployees = stats?.totalEmployees || 0

  const stateCounts = [
    { label: 'Available', count: availableCount, color: colors.status.available },
    { label: 'Allocated', count: allocatedCount, color: colors.status.allocated },
    { label: 'Reserved', count: bookingsCount, color: colors.status.reserved },
    { label: 'Under Maintenance', count: maintenanceCount, color: colors.status.maintenance },
  ]
  const totalAssets = stateCounts.reduce((sum, item) => sum + item.count, 0)

  // Map backend activity logs
  const activities: ActivityItem[] = stats?.recentActivities.map((act) => ({
    id: act.id,
    type: act.module.toLowerCase(),
    title: act.action,
    description: `${act.description} (by ${act.user.fullName})`,
    time: new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  })) || []

  return (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1400, margin: '0 auto' }}>
      
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Fleet Performance Dashboard
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Real-time tracking, state timeline summary, and logistics operational metrics.
          </p>
        </div>
      </div>

      {/* ── 1. KPI Card Row ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
        
        {/* Available */}
        <div className="panel" style={{ padding: '16px 18px', borderLeft: `3.5px solid ${colors.status.available}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Available Assets</span>
            <Boxes size={14} style={{ color: colors.status.available }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>{availableCount}</div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Ready for deployment</span>
          </div>
        </div>

        {/* Allocated */}
        <div className="panel" style={{ padding: '16px 18px', borderLeft: `3.5px solid ${colors.status.allocated}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Allocated Assets</span>
            <UserCheck size={14} style={{ color: colors.status.allocated }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>{allocatedCount}</div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Currently in use</span>
          </div>
        </div>

        {/* Maintenance */}
        <div className="panel" style={{ padding: '16px 18px', borderLeft: `3.5px solid ${colors.status.maintenance}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Under Maintenance</span>
            <Wrench size={14} style={{ color: colors.status.maintenance }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>{maintenanceCount}</div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>In active repair queue</span>
          </div>
        </div>

        {/* Bookings */}
        <div className="panel" style={{ padding: '16px 18px', borderLeft: `3.5px solid ${colors.status.reserved}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Active Bookings</span>
            <CalendarClock size={14} style={{ color: colors.status.reserved }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>{bookingsCount}</div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Reserved upcoming</span>
          </div>
        </div>

        {/* Total Employees */}
        <div className="panel" style={{ padding: '16px 18px', borderLeft: `3.5px solid var(--accent-cyan)`, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Employees</span>
            <ArrowLeftRight size={14} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>{totalEmployees}</div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Registered in workspace</span>
          </div>
        </div>

        {/* Active Today */}
        <div className="panel" style={{ padding: '16px 18px', borderLeft: `3.5px solid ${colors.status.retired}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Active Today</span>
            <Clock size={14} style={{ color: colors.status.retired }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>{stats?.activeUsersToday || 0}</div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Users active within 24h</span>
          </div>
        </div>

      </div>

      {/* ── 3. Quick Actions CTA Row ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <button
          onClick={() => handleAction('Register Asset')}
          className="panel"
          style={{ border: '1px solid var(--accent-cyan)', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, border: '1px solid var(--accent-cyan)', display: 'flex', alignItems: 'center', color: 'var(--accent-cyan)', background: 'rgba(12,202,200,0.06)', flexShrink: 0, justifyContent: 'center' }}>
              <PlusCircle size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>Register Asset</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Onboard new hardware or software license</div>
            </div>
          </div>
          <ArrowUpRight size={16} style={{ color: 'var(--accent-cyan)' }} />
        </button>

        <button
          onClick={() => handleAction('Book Resource')}
          className="panel"
          style={{ border: '1px solid var(--accent-cyan)', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, border: '1px solid var(--accent-cyan)', display: 'flex', alignItems: 'center', color: 'var(--accent-cyan)', background: 'rgba(12,202,200,0.06)', flexShrink: 0, justifyContent: 'center' }}>
              <CalendarPlus size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>Book Resource</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Schedule temporary equipment checkout</div>
            </div>
          </div>
          <ArrowUpRight size={16} style={{ color: 'var(--accent-cyan)' }} />
        </button>

        <button
          onClick={() => handleAction('Raise Maintenance Request')}
          className="panel"
          style={{ border: '1px solid var(--accent-cyan)', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, border: '1px solid var(--accent-cyan)', display: 'flex', alignItems: 'center', color: 'var(--accent-cyan)', background: 'rgba(12,202,200,0.06)', flexShrink: 0, justifyContent: 'center' }}>
              <Wrench size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>Raise Maintenance</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Report damaged items or request calibration</div>
            </div>
          </div>
          <ArrowUpRight size={16} style={{ color: 'var(--accent-cyan)' }} />
        </button>
      </div>

      {/* ── Main Dashboard Split ────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        
        {/* Left Side: Overdue & Multi-Asset StateRail Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: '2 1 600px' }}>
          
          {/* ── 2. Overdue Returns Compliance Panel ── */}
          <div className="panel" style={{ borderTop: `3px solid ${colors.status.lost}` }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={16} style={{ color: colors.status.lost }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Overdue Returns (Compliance Alert)
              </h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-soft)', color: 'var(--text-muted)', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 20px' }}>Asset ID</th>
                    <th style={{ padding: '12px 20px' }}>Asset Name</th>
                    <th style={{ padding: '12px 20px' }}>Current Holder</th>
                    <th style={{ padding: '12px 20px' }}>Department</th>
                    <th style={{ padding: '12px 20px', textAlign: 'right' }}>Overdue By</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '0.78rem' }}>
                  {overdueItems.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                      <td style={{ padding: '12px 20px', fontFamily: 'var(--font-data)', fontWeight: 600, color: colors.status.lost }}>{item.tag}</td>
                      <td style={{ padding: '12px 20px', color: 'var(--text-primary)' }}>{item.name}</td>
                      <td style={{ padding: '12px 20px' }}>{item.holder}</td>
                      <td style={{ padding: '12px 20px', color: 'var(--text-muted)' }}>{item.dept}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'right', fontFamily: 'var(--font-data)', fontWeight: 600, color: colors.status.lost }}>{item.daysOverdue} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── 4. Compact Multi-Asset StateRail Summary ── */}
          <div className="panel" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Fleet Lifecycle Distribution (StateRail Summary)
              </h3>
              <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-data)', color: 'var(--text-muted)' }}>
                {totalAssets} assets logged
              </span>
            </div>

            {/* Graphic multi-color stacked bar */}
            <div style={{ display: 'flex', height: 10, overflow: 'hidden', border: '1px solid var(--border-soft)' }}>
              {stateCounts.map((state) => (
                <div
                  key={state.label}
                  style={{
                    flex: state.count || 1, // prevent 0-flex rendering issues
                    background: state.color,
                  }}
                  title={`${state.label}: ${state.count} assets`}
                />
              ))}
            </div>

            {/* Detailed chips breakdown grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
              {stateCounts.map((state) => (
                <div key={state.label} className="panel" style={{ padding: '10px 12px', background: 'var(--bg-surface-raised)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, background: state.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {state.label}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-data)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {state.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Recent Activity feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: '1 1 300px' }}>
          
          {/* ── 5. Recent Activity Feed ── */}
          <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 320 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Boxes size={15} style={{ color: 'var(--accent-cyan)' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Recent Log Feed
              </h3>
            </div>
            
            {/* Scrollable feed list */}
            <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', maxHeight: 380, padding: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {activities.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: 10,
                      background: 'var(--bg-surface-raised)',
                      border: '1px solid var(--border-soft)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-mono)',
                          letterSpacing: '0.04em',
                          fontWeight: 600,
                          color:
                            item.type === 'assignment' ? colors.status.allocated :
                            item.type === 'maintenance' ? colors.status.maintenance :
                            item.type === 'booking' ? colors.status.reserved :
                            item.type === 'transfer' ? 'var(--accent-cyan)' :
                            colors.status.lost,
                        }}
                      >
                        {item.title}
                      </span>
                      <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-data)', color: 'var(--text-muted)' }}>
                        {item.time}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
