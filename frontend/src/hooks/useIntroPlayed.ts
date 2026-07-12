import { useCallback, useState } from 'react'

const SESSION_KEY = 'af_intro_played'

/**
 * Tracks whether the intro sequence has already played this browser session.
 * Uses sessionStorage so it resets when the tab is closed, but updates state
 * instantly so that conditional rendering unmounts the animation immediately.
 */
export function useIntroPlayed() {
  const [hasPlayed, setHasPlayed] = useState<boolean>(() => {
    try { return sessionStorage.getItem(SESSION_KEY) === '1' } catch { return false }
  })

  const markPlayed = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1')
      setHasPlayed(true)
    } catch { /* ignore */ }
  }, [])

  return { hasPlayed, markPlayed }
}
