/**
 * AppShell — Main layout wrapper (used as a React Router layout route)
 *
 * Renders: Sidebar + Topbar + <Outlet /> with page transitions.
 * Also owns the IntroSequence overlay and coordinates its reveal timing.
 */

import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { IntroSequence } from '@/components/IntroSequence'
import { useIntroPlayed } from '@/hooks/useIntroPlayed'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export function AppShell() {
  const { hasPlayed, markPlayed } = useIntroPlayed()
  const prefersReduced = usePrefersReducedMotion()
  const location = useLocation()

  // skipIntro = true when intro should not play at all
  // In development, skip the opening animation so navigation appears immediately.
  const skipIntro = hasPlayed || prefersReduced || import.meta.env.DEV

  // `reveal` drives the entrance animations of shell elements
  const [reveal, setReveal] = useState(skipIntro)

  const handleRevealStart = () => setReveal(true)
  const handleIntroComplete = () => markPlayed()

  // ── Animation props for shell elements ──────────────────────────────────────
  // When skipIntro=true: elements start fully visible (no entrance animation)
  // When skipIntro=false: elements start hidden; animate in when reveal=true
  const mkRevealProps = (delay = 0, extraInitial?: object, extraAnimate?: object): any => ({
    initial: skipIntro
      ? { opacity: 1, x: 0, ...(extraInitial ?? {}) }
      : { opacity: 0, x: 0, ...(extraInitial ?? {}) },
    animate: {
      opacity: 1,
      x: 0,
      ...(extraAnimate ?? {}),
    } as any,
    transition: {
      duration: skipIntro ? 0.01 : 0.32,
      delay: reveal && !skipIntro ? delay : 0,
      ease: [0.22, 1, 0.36, 1] as any,
    },
  })

  // Flicker then settle — used for the main content area reveal
  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: [0, 0.3, 0.05, 0.6, 0.25, 1] as number[],
      transition: {
        duration: skipIntro ? 0.01 : 0.38,
        delay: reveal && !skipIntro ? 0.18 : 0,
        times: [0, 0.2, 0.35, 0.55, 0.75, 1],
        ease: 'linear' as any,
      },
    },
  }

  // Page transition (fade + subtle x-slide)
  const pageVariants = {
    initial: { opacity: 0, x: prefersReduced ? 0 : 6 },
    enter:   { opacity: 1, x: 0, transition: { duration: 0.18, ease: 'easeOut' as any } },
    exit:    { opacity: 0, x: prefersReduced ? 0 : -6, transition: { duration: 0.13, ease: 'easeIn' as any } },
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100dvh',
        width: '100vw',
        overflow: 'hidden',
        background: 'var(--bg-void)',
        position: 'relative',
      }}
    >
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <Sidebar
        revealAnimProps={mkRevealProps(0, { x: -16 }, { x: reveal ? 0 : -16 })}
      />

      {/* ── Main area: Topbar + Content ─────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        {/* Topbar */}
        <Topbar
          revealAnimProps={mkRevealProps(0.06, { y: -10 }, { y: reveal ? 0 : -10 })}
        />

        {/* ── Content / Outlet ────────────────────────────────────── */}
        <motion.main
          variants={contentVariants}
          initial="hidden"
          animate={reveal ? 'visible' : 'hidden'}
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            background: 'var(--bg-void)',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.key}
              variants={pageVariants}
              initial="initial"
              animate="enter"
              exit="exit"
              style={{ minHeight: '100%' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </motion.main>
      </div>

      {/* ── Intro overlay (conditionally rendered) ──────────────── */}
      {!skipIntro && (
        <IntroSequence
          onRevealStart={handleRevealStart}
          onComplete={handleIntroComplete}
        />
      )}
    </div>
  )
}

export default AppShell
