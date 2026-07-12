import { useState } from 'react'
import {
  Bell,
  Boxes,
  CalendarCheck,
  CalendarX,
  CalendarClock,
  ArrowLeftRight,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

type NotifType =
  | 'Asset Assigned'
  | 'Maintenance Approved'
  | 'Maintenance Rejected'
  | 'Booking Confirmed'
  | 'Booking Cancelled'
  | 'Booking Reminder'
  | 'Transfer Approved'
  | 'Overdue Return Alert'
  | 'Audit Discrepancy'

interface Notification {
  id: string
  type: NotifType
  note: string
  timestamp: string
  read: boolean
}

type LogAction = 'Allocated Asset' | 'Raised Maintenance' | 'Approved Transfer' | 'Created Audit' | 'Booked Resource' | 'Marked Returned' | 'Promoted Role' | 'Rejected Maintenance'

interface ActivityEntry {
  timestamp: string
  user: string
  role: string
  action: LogAction
  target: string
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const INITIAL_NOTIFS: Notification[] = [
  { id: 'n1', type: 'Asset Assigned', note: 'AF-3302 ThinkPad X1 has been assigned to you by Raj Patel.', timestamp: '2026-07-12 09:14', read: false },
  { id: 'n2', type: 'Maintenance Approved', note: 'Your maintenance request for MacBook Pro 16" (AF-0114) has been approved.', timestamp: '2026-07-12 08:47', read: false },
  { id: 'n3', type: 'Booking Confirmed', note: 'Conference Room A booked for today 14:00 – 16:00 confirmed.', timestamp: '2026-07-12 08:30', read: false },
  { id: 'n4', type: 'Overdue Return Alert', note: 'AF-0114 MacBook Pro was due for return on 01 Jul. 11 days overdue.', timestamp: '2026-07-12 08:00', read: false },
  { id: 'n5', type: 'Transfer Approved', note: 'Transfer of AF-9921 iPhone 15 Pro Max from Rohan Roy to Vikram Singh approved.', timestamp: '2026-07-11 16:52', read: true },
  { id: 'n6', type: 'Booking Reminder', note: 'Reminder: Rally Plus Camera Kit booking starts in 30 minutes.', timestamp: '2026-07-11 12:30', read: true },
  { id: 'n7', type: 'Maintenance Rejected', note: 'Maintenance request for Dell UltraSharp 32" was rejected. Contact your manager.', timestamp: '2026-07-11 11:05', read: true },
  { id: 'n8', type: 'Audit Discrepancy', note: 'Discrepancy flagged in Warehouse Audit: A-1018 Backup Battery reported Missing.', timestamp: '2026-07-10 15:22', read: true },
  { id: 'n9', type: 'Booking Cancelled', note: 'Your Ford Transit Van booking on 2026-07-09 was cancelled by admin.', timestamp: '2026-07-09 14:10', read: true },
]

const ACTIVITY_LOG: ActivityEntry[] = [
  { timestamp: '2026-07-12 09:14', user: 'Raj Patel', role: 'Asset Manager', action: 'Allocated Asset', target: 'AF-3302 → Aarav Mehta' },
  { timestamp: '2026-07-12 08:55', user: 'Sarah Chen', role: 'Employee', action: 'Raised Maintenance', target: 'AF-0114 MacBook Pro' },
  { timestamp: '2026-07-12 08:47', user: 'Raj Patel', role: 'Asset Manager', action: 'Approved Transfer', target: 'AF-9921 Rohan Roy → Vikram Singh' },
  { timestamp: '2026-07-12 08:30', user: 'Priya Sharma', role: 'Employee', action: 'Booked Resource', target: 'Conference Room A 14:00–16:00' },
  { timestamp: '2026-07-11 16:22', user: 'Mina Chen', role: 'Admin', action: 'Created Audit', target: 'Warehouse 12 Audit Cycle' },
  { timestamp: '2026-07-11 14:48', user: 'Sophia Lee', role: 'Department Head', action: 'Marked Returned', target: 'AF-4410 Logitech Rally Kit' },
  { timestamp: '2026-07-11 11:05', user: 'Raj Patel', role: 'Asset Manager', action: 'Rejected Maintenance', target: 'AF-0824 Dell UltraSharp' },
  { timestamp: '2026-07-10 15:10', user: 'Mina Chen', role: 'Admin', action: 'Promoted Role', target: 'Vikram Singh → Department Head' },
  { timestamp: '2026-07-09 12:00', user: 'Priya Sharma', role: 'Employee', action: 'Raised Maintenance', target: 'AF-5501 FortiGate Firewall' },
  { timestamp: '2026-07-08 09:30', user: 'Aarav Mehta', role: 'Employee', action: 'Booked Resource', target: 'Boardroom Suite 10:00–12:00' },
]

// ─── Icon & color map ──────────────────────────────────────────────────────────

const NOTIF_META: Record<NotifType, { icon: typeof Bell; color: string }> = {
  'Asset Assigned':       { icon: Boxes,          color: 'var(--accent-cyan)' },
  'Maintenance Approved': { icon: CheckCircle,     color: 'var(--status-available)' },
  'Maintenance Rejected': { icon: XCircle,         color: 'var(--status-lost)' },
  'Booking Confirmed':    { icon: CalendarCheck,   color: 'var(--status-allocated)' },
  'Booking Cancelled':    { icon: CalendarX,       color: 'var(--status-retired)' },
  'Booking Reminder':     { icon: CalendarClock,   color: 'var(--status-reserved)' },
  'Transfer Approved':    { icon: ArrowLeftRight,  color: 'var(--status-available)' },
  'Overdue Return Alert': { icon: AlertTriangle,   color: 'var(--status-lost)' },
  'Audit Discrepancy':    { icon: ShieldAlert,     color: 'var(--status-reserved)' },
}

const ACTION_COLOR: Record<LogAction, string> = {
  'Allocated Asset':    'var(--accent-cyan)',
  'Raised Maintenance': 'var(--status-reserved)',
  'Approved Transfer':  'var(--status-available)',
  'Created Audit':      'var(--status-allocated)',
  'Booked Resource':    'var(--status-allocated)',
  'Marked Returned':    'var(--status-available)',
  'Promoted Role':      'var(--status-maintenance)',
  'Rejected Maintenance': 'var(--status-lost)',
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ActivityPage() {
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS)
  const [filterUnread, setFilterUnread] = useState(false)
  const [logFilter, setLogFilter] = useState('')

  const unreadCount = notifs.filter(n => !n.read).length

  const visibleNotifs = filterUnread ? notifs.filter(n => !n.read) : notifs

  const markAllRead = () => setNotifs(ns => ns.map(n => ({ ...n, read: true })))
  const markRead = (id: string) => setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n))

  const filteredLog = logFilter
    ? ACTIVITY_LOG.filter(e => e.user.toLowerCase().includes(logFilter.toLowerCase()) || e.action.toLowerCase().includes(logFilter.toLowerCase()) || e.target.toLowerCase().includes(logFilter.toLowerCase()))
    : ACTIVITY_LOG

  return (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Activity & Notifications</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>System-wide event log and real-time notifications.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {unreadCount > 0 && (
            <span style={{ padding: '3px 8px', background: 'rgba(12,202,200,0.14)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', fontSize: '0.7rem', fontWeight: 700 }}>
              {unreadCount} unread
            </span>
          )}
          <Bell size={16} style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 420px) 1fr', gap: 20, alignItems: 'start' }}>
        {/* ── Notifications Panel ─────────────────────────────── */}
        <div className="panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Notifications</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => setFilterUnread(f => !f)}
                style={{ background: filterUnread ? 'rgba(12,202,200,0.14)' : 'none', border: `1px solid ${filterUnread ? 'var(--accent-cyan)' : 'var(--border-soft)'}`, padding: '3px 8px', cursor: 'pointer', fontSize: '0.65rem', color: filterUnread ? 'var(--accent-cyan)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Filter size={10} /> Unread
              </button>
              {unreadCount > 0 && (
                <button onClick={markAllRead}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.65rem', color: 'var(--text-muted)', padding: '3px 0' }}>
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div style={{ maxHeight: 560, overflowY: 'auto' }}>
            {visibleNotifs.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                <Bell size={24} style={{ opacity: 0.3, marginBottom: 8 }} />
                <p>No unread notifications.</p>
              </div>
            ) : visibleNotifs.map(n => {
              const meta = NOTIF_META[n.type]
              const Icon = meta.icon
              return (
                <div key={n.id} onClick={() => markRead(n.id)}
                  style={{
                    padding: '12px 16px', borderBottom: '1px solid var(--border-soft)', cursor: 'pointer',
                    background: n.read ? 'transparent' : 'rgba(12,202,200,0.04)',
                    transition: 'background 0.15s',
                  }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 28, height: 28, flexShrink: 0, background: `${meta.color}18`, border: `1px solid ${meta.color}30`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                      <Icon size={13} style={{ color: meta.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: meta.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{n.type}</p>
                        {!n.read && <span style={{ width: 6, height: 6, background: 'var(--accent-cyan)', borderRadius: '50%', flexShrink: 0 }} />}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', lineHeight: 1.45, marginBottom: 4 }}>{n.note}</p>
                      <p style={{ fontSize: '0.62rem', fontFamily: 'var(--font-data)', color: 'var(--text-muted)' }}>
                        <Clock size={9} style={{ marginRight: 3, verticalAlign: 'middle' }} />
                        {n.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Activity Log ─────────────────────────────────────── */}
        <div className="panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Full Activity Log</h3>
            <input
              value={logFilter} onChange={e => setLogFilter(e.target.value)}
              placeholder="Filter user, action, or target…"
              style={{ background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: '5px 10px', fontSize: '0.72rem', color: 'var(--text-primary)', outline: 'none', width: 220 }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-soft)', color: 'var(--text-muted)', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 14px' }}>Timestamp</th>
                  <th style={{ padding: '10px 14px' }}>User</th>
                  <th style={{ padding: '10px 14px' }}>Role</th>
                  <th style={{ padding: '10px 14px' }}>Action</th>
                  <th style={{ padding: '10px 14px' }}>Target</th>
                </tr>
              </thead>
              <tbody>
                {filteredLog.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '28px 14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>No entries match your filter.</td></tr>
                ) : filteredLog.map((e, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                    <td style={{ padding: '9px 14px', fontFamily: 'var(--font-data)', fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{e.timestamp}</td>
                    <td style={{ padding: '9px 14px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{e.user}</td>
                    <td style={{ padding: '9px 14px', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{e.role}</td>
                    <td style={{ padding: '9px 14px', fontSize: '0.72rem', fontWeight: 600, color: ACTION_COLOR[e.action] }}>{e.action}</td>
                    <td style={{ padding: '9px 14px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{e.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
