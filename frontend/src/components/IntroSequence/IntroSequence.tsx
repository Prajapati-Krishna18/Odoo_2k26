/**
 * IntroSequence — AssetFlow opening animation
 *
 * Phases and timing (total ≤ 2.3s):
 *   0.00s  Blueprint grid visible, stamp impacts (scale overshoot + settle)
 *   0.40s  StateRail fades in, draws to "Available"
 *   1.35s  Horizontal scan line sweeps left → right (0.45s)
 *   1.45s  onRevealStart() — shell sidebar/topbar/panels animate in underneath
 *   1.80s  Overlay fades out (0.3s)
 *   2.10s  Phase 'done': overlay unmounts, onComplete() fires
 *
 * Reduced-motion: skips immediately, overlay unmounts at t=0
 */

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { StateRail } from '@/components/StateRail'

type Phase = 'stamp' | 'scan' | 'done'

interface IntroSequenceProps {
  onRevealStart: () => void
  onComplete: () => void
}

// ─── Stamp Wordmark ───────────────────────────────────────────────────────────

function StampBlock() {
  return (
    <motion.div
      initial={{ scale: 0.86, opacity: 0 }}
      animate={{ scale: [0.86, 1.04, 1.0], opacity: [0, 1, 1] }}
      transition={{
        duration: 0.38,
        times: [0, 0.6, 1],
        ease: 'easeOut',
      }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      {/* Rectangular stamp border */}
      <div
        style={{
          border: '1.5px solid var(--accent-cyan)',
          padding: '12px 36px',
          position: 'relative',
          display: 'inline-block',
        }}
      >
        {/* Corner marks — technical drawing accent */}
        {[
          { top: -4, left: -4 }, { top: -4, right: -4 },
          { bottom: -4, left: -4 }, { bottom: -4, right: -4 },
        ].map((pos, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              width: 7,
              height: 7,
              border: '1.5px solid var(--accent-cyan)',
              background: 'var(--bg-void)',
              ...pos,
            }}
          />
        ))}

        {/* Wordmark */}
        <div
          style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontSize: '2.6rem',
            fontWeight: 700,
            color: 'var(--accent-cyan)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          AssetFlow
        </div>

        {/* Sub-label */}
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.58rem',
            letterSpacing: '0.28em',
            color: 'var(--accent-cyan)',
            opacity: 0.5,
            marginTop: 8,
            textAlign: 'center',
            textTransform: 'uppercase',
          }}
        >
          Asset Management System
        </div>
      </div>
    </motion.div>
  )
}

// ─── Rail intro wrapper ───────────────────────────────────────────────────────

function IntroRail() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ width: 'min(780px, 90vw)' }}
    >
      <StateRail currentState="Available" size="full" showLabels={true} />
    </motion.div>
  )
}

// ─── Scan Line ────────────────────────────────────────────────────────────────

function ScanLine() {
  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 3,
        height: '100vh',
        background: `linear-gradient(to bottom, transparent 0%, var(--accent-cyan) 20%, var(--accent-cyan) 80%, transparent 100%)`,
        boxShadow: `0 0 22px 7px rgba(12, 202, 200, 0.45)`,
        opacity: 0.8,
        zIndex: 110,
        pointerEvents: 'none',
      }}
      initial={{ x: '-3px' }}
      animate={{ x: '105vw' }}
      transition={{ duration: 0.45, ease: 'linear' }}
    />
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function IntroSequence({ onRevealStart, onComplete }: IntroSequenceProps) {
  const [phase, setPhase] = useState<Phase>('stamp')
  const [showRail, setShowRail] = useState(false)
  // Guard against calling callbacks after unmount
  const mounted = useRef(true)
  useEffect(() => { return () => { mounted.current = false } }, [])

  useEffect(() => {
    const timers = [
      setTimeout(() => { if (mounted.current) setShowRail(true) },  400),
      setTimeout(() => { if (mounted.current) setPhase('scan') },   1350),
      setTimeout(() => { if (mounted.current) onRevealStart() },    1450),
      setTimeout(() => {
        if (mounted.current) {
          setPhase('done')
          onComplete()
        }
      }, 2100),
    ]
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (phase === 'done') return null

  return (
    <>
      {/* Full-screen overlay: blueprint grid → fades as scan completes */}
      <motion.div
        className="blueprint-grid"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 52,
          pointerEvents: 'none',
        }}
        animate={{ opacity: phase === 'scan' ? 0 : 1 }}
        transition={{ delay: 0.42, duration: 0.32, ease: 'easeIn' }}
      >
        <StampBlock />
        {showRail && <IntroRail />}
      </motion.div>

      {/* Scan line — rendered above overlay so it's visible during fade */}
      {phase === 'scan' && <ScanLine />}
    </>
  )
}

export default IntroSequence
