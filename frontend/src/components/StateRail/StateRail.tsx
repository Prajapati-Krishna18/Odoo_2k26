import { useEffect, useId, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { colors } from '@/lib/tokens'

// ─── Types & Configuration ────────────────────────────────────────────────────

export type LifecycleState =
  | 'Available'
  | 'Allocated'
  | 'Reserved'
  | 'Under Maintenance'
  | 'Lost'
  | 'Retired'
  | 'Disposed'

export interface StateRailProps {
  /** The current state of the asset */
  currentState: LifecycleState
  /** Size layout: 'compact' (inline table rows) or 'full' (details view) */
  size?: 'compact' | 'full'
  /** Explicitly show/hide labels (defaults: true for full, false for compact) */
  showLabels?: boolean
  /** Optional class name */
  className?: string
}

// Hook to check for prefers-reduced-motion
function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return prefersReduced
}

// ─── Lifecycle States Array ───────────────────────────────────────────────────

interface StateItem {
  key: string
  label: LifecycleState
  color: string
}

const LIFECYCLE_STATES: StateItem[] = [
  { key: 'available',   label: 'Available',         color: colors.status.available },
  { key: 'allocated',   label: 'Allocated',         color: colors.status.allocated },
  { key: 'reserved',    label: 'Reserved',          color: colors.status.reserved },
  { key: 'maintenance', label: 'Under Maintenance', color: colors.status.maintenance },
  { key: 'lost',        label: 'Lost',              color: colors.status.lost },
  { key: 'retired',     label: 'Retired',           color: colors.status.retired },
  { key: 'disposed',    label: 'Disposed',          color: colors.status.disposed },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function StateRail({
  currentState,
  size = 'full',
  showLabels = size === 'full',
  className = '',
}: StateRailProps) {
  const prefersReduced = usePrefersReducedMotion()
  const rawId = useId()
  const uid = useRef(rawId.replace(/:/g, 'r')).current

  // Find active index
  const activeIndex = LIFECYCLE_STATES.findIndex(
    (s) => s.label.toLowerCase() === currentState.toLowerCase()
  )
  const activeState = activeIndex !== -1 ? LIFECYCLE_STATES[activeIndex] : LIFECYCLE_STATES[0]
  const actualActiveIndex = activeIndex !== -1 ? activeIndex : 0

  // Layout calculations
  const isFull = size === 'full'

  // SVG viewBox settings
  const width = isFull ? 880 : 320
  const height = isFull ? (showLabels ? 85 : 45) : 24
  const paddingX = isFull ? 45 : 12
  const centerY = isFull ? 25 : 12

  const trackWidth = width - paddingX * 2
  const gap = trackWidth / (LIFECYCLE_STATES.length - 1)

  // Node sizes (diamonds / squares)
  const inactiveSide = isFull ? 7 : 5.5
  const activeSide = isFull ? 11.5 : 8

  // Calculate coordinates for nodes
  const nodes = LIFECYCLE_STATES.map((state, index) => {
    const x = paddingX + index * gap
    const isActive = index === actualActiveIndex
    const isVisited = index <= actualActiveIndex
    return {
      ...state,
      x,
      isActive,
      isVisited,
    }
  })

  const activeNodeX = nodes[actualActiveIndex].x
  const startNodeX = nodes[0].x

  // Animation constants
  const duration = prefersReduced ? 0 : 0.8
  const delayNode = prefersReduced ? 0 : duration - 0.15

  return (
    <div className={`w-full overflow-x-auto select-none ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block overflow-visible"
        style={{ minWidth: isFull ? '640px' : '260px' }}
      >
        <defs>
          {/* Neon Glow Filter */}
          <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={isFull ? '4.5' : '2.5'} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Base rail background (gray/border-soft) */}
        <line
          x1={startNodeX}
          y1={centerY}
          x2={nodes[nodes.length - 1].x}
          y2={centerY}
          stroke="var(--border-soft)"
          strokeWidth={isFull ? 1.5 : 1}
          strokeLinecap="round"
        />

        {/* 2. Active progress signal rail (draws to current state) */}
        {actualActiveIndex > 0 && (
          <motion.line
            x1={startNodeX}
            y1={centerY}
            initial={{ x2: startNodeX }}
            animate={{ x2: activeNodeX }}
            transition={{
              duration,
              ease: [0.25, 1, 0.5, 1], // premium ease-out
            }}
            stroke={activeState.color}
            strokeWidth={isFull ? 2 : 1.5}
            strokeLinecap="round"
          />
        )}

        {/* 3. Inactive and active nodes */}
        {nodes.map((node) => {
          const side = node.isActive ? activeSide : inactiveSide
          const half = side / 2

          // Check if node is active
          if (node.isActive) {
            return (
              <g key={node.key}>
                {/* Glowing ring/pulse behind active state */}
                {!prefersReduced && (
                  <motion.rect
                    x={node.x - half}
                    y={centerY - half}
                    width={side}
                    height={side}
                    transform={`rotate(45 ${node.x} ${centerY})`}
                    fill={node.color}
                    opacity={0.15}
                    animate={{
                      scale: [1, 1.8, 1],
                      opacity: [0.35, 0.05, 0.35],
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{ transformOrigin: `${node.x}px ${centerY}px` }}
                  />
                )}

                {/* Primary Active diamond node */}
                <motion.rect
                  x={node.x - half}
                  y={centerY - half}
                  width={side}
                  height={side}
                  transform={`rotate(45 ${node.x} ${centerY})`}
                  fill={node.color}
                  stroke={node.color}
                  strokeWidth={1}
                  filter={`url(#${uid}-glow)`}
                  initial={prefersReduced ? { scale: 1 } : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 120,
                    damping: 10,
                    delay: delayNode,
                  }}
                  style={{ transformOrigin: `${node.x}px ${centerY}px` }}
                />
              </g>
            )
          }

          // Visited or unvisited inactive node
          return (
            <g key={node.key}>
              <rect
                x={node.x - half}
                y={centerY - half}
                width={side}
                height={side}
                transform={`rotate(45 ${node.x} ${centerY})`}
                fill={node.isVisited ? 'transparent' : 'var(--bg-surface-raised)'}
                stroke={node.isVisited ? activeState.color : 'var(--border-soft)'}
                strokeWidth={isFull ? 1.5 : 1}
                className="transition-all duration-300"
              />
            </g>
          )
        })}

        {/* 4. Labels (rendered for full size or when showLabels is true) */}
        {showLabels &&
          nodes.map((node) => {
            const isLabelActive = node.isActive
            return (
              <text
                key={node.key}
                x={node.x}
                y={centerY + (isFull ? 30 : 20)}
                textAnchor="middle"
                className="transition-colors duration-300"
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: isFull ? '10px' : '9px',
                  fontWeight: isLabelActive ? 700 : 500,
                  fill: isLabelActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {node.label}
              </text>
            )
          })}
      </svg>
    </div>
  )
}

export default StateRail
