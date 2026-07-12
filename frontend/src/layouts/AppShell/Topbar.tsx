/**
 * Topbar — Global application header
 *
 * Left:   Page title (Space Grotesk)
 * Center: Search bar (asset tag / serial / employee lookup)
 * Right:  Notification bell with count badge + User info card
 */

import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, X, LogOut, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

// ─── Page title map ───────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  '/':            'Dashboard',
  '/org-setup':   'Organization Setup',
  '/assets':      'Asset Directory',
  '/allocations': 'Allocation & Transfer',
  '/bookings':    'Resource Booking',
  '/maintenance': 'Maintenance',
  '/audits':      'Audits',
  '/reports':     'Reports',
  '/activity':    'Activity Logs',
}

// ─── Role badge colors ────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  Admin:            'var(--accent-cyan)',
  'Asset Manager':  'var(--status-allocated)',
  'Department Head':'var(--status-reserved)',
  Employee:         'var(--text-muted)',
}

// ─── Topbar component ─────────────────────────────────────────────────────────

interface TopbarProps {
  revealAnimProps: any
}

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'info',    message: 'New asset HP ProBook 450 assigned to you.', time: '2m ago' },
  { id: 2, type: 'success', message: 'Maintenance request #MR-1042 completed.',   time: '1h ago' },
  { id: 3, type: 'warning', message: 'Booking #BK-089 expires in 24 hours.',      time: '3h ago' },
  { id: 4, type: 'info',    message: 'Department head approved allocation #AL-22.',time: '5h ago' },
]

const NOTIF_ICONS: Record<string, { icon: any; color: string }> = {
  info:    { icon: Info,        color: 'var(--accent-cyan)' },
  success: { icon: CheckCircle, color: 'var(--status-active)' },
  warning: { icon: AlertTriangle, color: 'var(--status-lost)' },
}

export function Topbar({ revealAnimProps }: TopbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [notifOpen])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'AssetFlow'

  return (
    <motion.header
      {...revealAnimProps}
      style={{
        height: 56,
        flexShrink: 0,
        borderBottom: '1px solid var(--border-soft)',
        background: 'var(--bg-surface)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '0 20px',
        position: 'relative',
        zIndex: 5,
      }}
    >
      {/* ── Page Title ──────────────────────────────────────────── */}
      <div style={{ flex: 1 }}>
        <h1
          style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          {pageTitle}
        </h1>
      </div>

      {/* ── Global Search ────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {searchOpen ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              border: `1px solid var(--accent-cyan)`,
              padding: '5px 10px',
              background: 'var(--bg-surface-raised)',
            }}
          >
            <Search size={13} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
            <input
              autoFocus
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search asset tag, serial, employee…"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontFamily: "'Inter', system-ui",
                fontSize: '0.8rem',
                width: 240,
              }}
              onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
            />
            <button
              onClick={() => { setSearchOpen(false); setSearchVal('') }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            title="Search assets, serials, employees"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-soft)',
              padding: '5px 12px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontFamily: "'Inter', system-ui",
              transition: 'border-color 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.borderColor = 'var(--accent-cyan)'
              el.style.color = 'var(--text-primary)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.borderColor = 'var(--border-soft)'
              el.style.color = 'var(--text-muted)'
            }}
          >
            <Search size={13} />
            <span>Search</span>
            <span
              style={{
                marginLeft: 4,
                fontSize: '0.65rem',
                fontFamily: "'Space Mono', monospace",
                opacity: 0.5,
                letterSpacing: '0.05em',
              }}
            >
              Ctrl K
            </span>
          </button>
        )}
      </div>

      {/* ── Notification Bell + Dropdown ────────────────────────── */}
      <div ref={notifRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setNotifOpen((o) => !o)}
          style={{
            position: 'relative',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: notifOpen ? 'var(--text-primary)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            padding: 6,
            transition: 'color 0.15s ease',
          }}
          title={`${user.notificationCount} unread notifications`}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)' }}
          onMouseLeave={(e) => { if (!notifOpen) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
        >
          <Bell size={16} />
          {user.notificationCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                width: 14,
                height: 14,
                background: 'var(--status-lost)',
                color: '#fff',
                fontSize: '0.6rem',
                fontFamily: "'Space Mono', monospace",
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                border: '1.5px solid var(--bg-surface)',
              }}
            >
              {user.notificationCount}
            </motion.span>
          )}
        </button>

        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: 320,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-soft)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                zIndex: 100,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--border-soft)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  fontFamily: "'Space Grotesk', system-ui",
                  letterSpacing: '0.02em',
                }}
              >
                NOTIFICATIONS
              </div>
              <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                {MOCK_NOTIFICATIONS.map((n) => {
                  const Meta = NOTIF_ICONS[n.type]
                  const Icon = Meta.icon
                  return (
                    <div
                      key={n.id}
                      style={{
                        display: 'flex',
                        gap: 10,
                        padding: '10px 14px',
                        borderBottom: '1px solid var(--border-soft)',
                        cursor: 'default',
                        transition: 'background 0.12s ease',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface-raised)' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                    >
                      <Icon size={14} style={{ color: Meta.color, flexShrink: 0, marginTop: 2 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 3 }}>
                          {n.time}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div
                style={{
                  padding: '8px 14px',
                  borderTop: '1px solid var(--border-soft)',
                  textAlign: 'center',
                }}
              >
                <button
                  onClick={() => setNotifOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-cyan)',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    fontFamily: "'Inter', system-ui",
                    letterSpacing: '0.04em',
                  }}
                >
                  VIEW ALL
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── User Info ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '5px 10px 5px 12px',
          border: '1px solid var(--border-soft)',
          background: 'var(--bg-surface-raised)',
          cursor: 'default',
        }}
      >
        {/* Avatar / initials */}
        <div
          style={{
            width: 28,
            height: 28,
            background: 'var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Space Grotesk', system-ui",
            fontWeight: 700,
            fontSize: '0.7rem',
            color: 'var(--bg-void)',
            flexShrink: 0,
          }}
        >
          {user.initials}
        </div>

        {/* Name + Role */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            {user.name}
          </span>
          <span
            style={{
              fontSize: '0.6rem',
              fontFamily: "'IBM Plex Mono', monospace",
              color: ROLE_COLORS[user.role] ?? 'var(--text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            {user.role}
          </span>
        </div>
      </div>

      {/* ── Logout ────────────────────────────────────────────────── */}
      <button
        onClick={handleLogout}
        title="Logout"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          padding: 6,
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--status-lost)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
      >
        <LogOut size={16} />
      </button>
    </motion.header>
  )
}

export default Topbar
