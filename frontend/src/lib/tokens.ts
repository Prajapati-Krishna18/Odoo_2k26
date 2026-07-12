/**
 * AssetFlow Design Tokens — JS/TS mirror of global.css
 * Use in framer-motion variants, dynamic SVG, and inline styles.
 */

export const colors = {
  bg: {
    void:          '#0B120E',
    surface:       '#131F19',
    surfaceRaised: '#1B2B22',
  },
  border: {
    soft: '#24382C',
  },
  text: {
    primary: '#EDF3EA',
    muted:   '#8FA396',
  },
  accent: {
    cyan: '#0CCAC8',
  },
  status: {
    available:   '#2FA66B',
    allocated:   '#4869A6',
    reserved:    '#E3A857',
    maintenance: '#9061F9',
    lost:        '#E06258',
    retired:     '#6B7280',
    disposed:    '#374151',
  },
} as const

export const fonts = {
  display: "'Space Grotesk', system-ui, sans-serif",
  body:    "'Inter', system-ui, sans-serif",
  mono:    "'Space Mono', monospace",
  data:    "'IBM Plex Mono', monospace",
} as const

/** All 7 lifecycle state keys in order */
export const StateKeys = [
  'available',
  'allocated',
  'reserved',
  'maintenance',
  'lost',
  'retired',
  'disposed',
] as const

export type StateKey = typeof StateKeys[number]

export const StateLabels = [
  'Available',
  'Allocated',
  'Reserved',
  'Under Maintenance',
  'Lost',
  'Retired',
  'Disposed',
] as const

export type StateLabel = typeof StateLabels[number]
