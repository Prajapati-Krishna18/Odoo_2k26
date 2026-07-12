/**
 * PlaceholderPage — shared skeleton for all in-progress routes.
 * Shows the page title, an icon, and a "coming soon" panel.
 */

import type { LucideIcon } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  icon: LucideIcon
  description?: string
}

export function PlaceholderPage({
  title,
  icon: Icon,
  description = 'This section is under construction. Content will appear here soon.',
}: PlaceholderPageProps) {
  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Breadcrumb-style header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            border: '1px solid var(--border-soft)',
            padding: '3px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-muted)',
            fontSize: '0.72rem',
            fontFamily: "'Space Mono', monospace",
            letterSpacing: '0.08em',
          }}
        >
          <Icon size={12} />
          {title.toUpperCase()}
        </div>
      </div>

      {/* Placeholder panel */}
      <div
        className="panel"
        style={{
          minHeight: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 48,
          borderStyle: 'dashed',
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            border: '1px solid var(--border-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            opacity: 0.5,
          }}
        >
          <Icon size={22} />
        </div>

        <div style={{ textAlign: 'center', maxWidth: 340 }}>
          <h2
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 600,
              fontSize: '1.1rem',
              color: 'var(--text-primary)',
              marginBottom: 8,
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              fontFamily: "'Inter', system-ui",
            }}
          >
            {description}
          </p>
        </div>

        <div
          style={{
            marginTop: 8,
            border: '1px solid var(--accent-cyan)',
            padding: '4px 16px',
            fontSize: '0.65rem',
            fontFamily: "'Space Mono', monospace",
            letterSpacing: '0.2em',
            color: 'var(--accent-cyan)',
            textTransform: 'uppercase',
          }}
        >
          In Development
        </div>
      </div>
    </div>
  )
}

export default PlaceholderPage
