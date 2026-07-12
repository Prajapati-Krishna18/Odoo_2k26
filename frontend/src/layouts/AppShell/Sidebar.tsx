/**
 * Sidebar — "Dispatch Panel" navigation
 *
 * Collapsible to icon-only mode via toggle at bottom.
 * Active item: thin --accent-cyan left border + raised background.
 * Admin-only items are hidden for non-Admin roles.
 */

import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Building2,
  Boxes,
  ArrowLeftRight,
  CalendarClock,
  Wrench,
  ClipboardCheck,
  BarChart3,
  History,
  ChevronLeft,
  ChevronRight,
  UserCog,
} from 'lucide-react'
import { useAuth, ALL_ROLES, type UserRole } from '@/context/AuthContext'
import { colors } from '@/lib/tokens'

// ─── Nav definitions ──────────────────────────────────────────────────────────

interface NavItem {
  label: string
  icon: React.FC<{ size?: number; className?: string; color?: string }>
  path: string
  end?: boolean
  adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',            icon: LayoutDashboard, path: '/',            end: true },
  { label: 'Organization Setup',   icon: Building2,       path: '/org-setup',   adminOnly: true },
  { label: 'Asset Directory',      icon: Boxes,           path: '/assets' },
  { label: 'Allocation & Transfer',icon: ArrowLeftRight,  path: '/allocations' },
  { label: 'Resource Booking',     icon: CalendarClock,   path: '/bookings' },
  { label: 'Maintenance',          icon: Wrench,          path: '/maintenance' },
  { label: 'Audits',               icon: ClipboardCheck,  path: '/audits' },
  { label: 'Reports',              icon: BarChart3,       path: '/reports' },
  { label: 'Activity Logs',        icon: History,         path: '/activity' },
]

const SIDEBAR_W = 240
const SIDEBAR_W_COLLAPSED = 56

// ─── Sidebar Component ────────────────────────────────────────────────────────

interface SidebarProps {
  revealAnimProps: any
}

export function Sidebar({ revealAnimProps }: SidebarProps) {
  const { user, setRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const isActiveItem = (itemPath: string) => {
    if (itemPath === '/') return location.pathname === '/'
    return location.pathname === itemPath || location.pathname.startsWith(`${itemPath}/`)
  }

  return (
    <motion.aside
      {...revealAnimProps}
      style={{
        height: '100dvh',
        width: collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W,
        flexShrink: 0,
        borderRight: `1px solid var(--border-soft)`,
        background: 'var(--bg-surface)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 20,
        transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s ease',
      }}
    >
      {/* ── Wordmark ──────────────────────────────────────────────── */}
      <div
        style={{
          padding: collapsed ? '18px 0' : '18px 16px',
          borderBottom: `1px solid var(--border-soft)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          flexShrink: 0,
          overflow: 'hidden',
          minHeight: 60,
        }}
      >
        {collapsed ? (
          /* Collapsed: just the stamp-box icon */
          <div
            style={{
              border: `1.5px solid var(--accent-cyan)`,
              width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent-cyan)',
              fontFamily: "'Space Grotesk', system-ui",
              fontWeight: 700, fontSize: '0.8rem',
            }}
          >
            AF
          </div>
        ) : (
          /* Expanded: full stamp-box wordmark */
          <div className="stamp-box" style={{ whiteSpace: 'nowrap' }}>
            <span
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: '1.05rem',
                color: 'var(--accent-cyan)',
                letterSpacing: '-0.02em',
              }}
            >
              AssetFlow
            </span>
          </div>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────────────────── */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingTop: 8,
          paddingBottom: 8,
        }}
      >
        {NAV_ITEMS.map((item) => {
          // Admin-only gating
          if (item.adminOnly && user.role !== 'Admin') return null

          const isActive = isActiveItem(item.path)

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              style={{
                display: 'block',
                width: '100%',
                textDecoration: 'none',
                background: 'transparent',
                border: 'none',
                padding: 0,
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: collapsed ? '10px 0' : '10px 14px 10px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderLeft: isActive
                    ? `2px solid var(--accent-cyan)`
                    : '2px solid transparent',
                  background: isActive ? 'var(--bg-surface-raised)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLDivElement).style.background = 'rgba(27,43,34,0.6)'
                    ;(e.currentTarget as HTMLDivElement).style.color = 'var(--text-primary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLDivElement).style.color = 'var(--text-muted)'
                  }
                }}
              >
                <item.icon
                  size={16}
                  color={isActive ? colors.accent.cyan : undefined}
                  className="flex-shrink-0"
                />
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.18 }}
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: isActive ? 600 : 400,
                        overflow: 'hidden',
                        display: 'block',
                      }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </button>
          )
        })}
      </nav>

      {/* ── Footer: Role Switcher + Collapse Toggle ────────────────── */}
      <div
        style={{
          borderTop: `1px solid var(--border-soft)`,
          flexShrink: 0,
        }}
      >
        {/* Role Switcher */}
        {!collapsed && (
          <div style={{ padding: '10px 14px', borderBottom: `1px solid var(--border-soft)` }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 6,
                color: 'var(--text-muted)',
              }}
            >
              <UserCog size={12} />
              <span style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Dev: Role Preview
              </span>
            </div>
            <select
              value={user.role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              style={{
                width: '100%',
                background: 'var(--bg-surface-raised)',
                border: `1px solid var(--border-soft)`,
                color: 'var(--text-primary)',
                padding: '5px 8px',
                fontSize: '0.75rem',
                fontFamily: "'Inter', system-ui",
                borderRadius: 0,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-end',
            padding: '10px 14px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            gap: 6,
            fontSize: '0.72rem',
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
        >
          {collapsed ? (
            <ChevronRight size={14} />
          ) : (
            <>
              <span style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>COLLAPSE</span>
              <ChevronLeft size={14} />
            </>
          )}
        </button>
      </div>
    </motion.aside>
  )
}

export default Sidebar
