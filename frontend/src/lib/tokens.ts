/**
 * Ecosphere Design Tokens — JS/TS mirror of global.css
 * Use these in framer-motion variants, dynamic SVG, and inline styles.
 * For Tailwind utilities, always prefer CSS classes.
 */

export const colors = {
  bg: {
    void:         '#0B120E',
    surface:      '#131F19',
    surfaceRaised:'#1B2B22',
  },
  border: {
    soft: '#24382C',
  },
  text: {
    primary: '#EDF3EA',
    muted:   '#8FA396',
  },
  env: {
    primary: '#2FA66B',
    glow:    '#7FE3A8',
  },
  social: {
    primary: '#E3A857',
    glow:    '#F5CE8C',
  },
  gov: {
    primary: '#4869A6',
    glow:    '#8FB0E0',
  },
  /** XP/Gamification ONLY — never use for E/S/G chart data */
  xp: {
    accent: '#C7F45B',
  },
  danger: '#E06258',
} as const

export const fonts = {
  display: "'Fraunces', Georgia, serif",
  body:    "'Inter', system-ui, sans-serif",
  /** Use for ALL numeric/data display: scores, XP, dates, IDs, percentages */
  mono:    "'Space Mono', 'Courier New', monospace",
} as const

export const radius = {
  panel:   '24px',
  panelSm: '20px',
  panelLg: '28px',
  chip:    '10px',
  btn:     '12px',
} as const

export const shadows = {
  soft:       '0 4px 24px 0 rgba(0, 0, 0, 0.35)',
  panel:      '0 8px 40px 0 rgba(0, 0, 0, 0.40)',
  envGlow:    '0 0 28px 0 rgba(127, 227, 168, 0.18)',
  socialGlow: '0 0 28px 0 rgba(245, 206, 140, 0.18)',
  govGlow:    '0 0 28px 0 rgba(143, 176, 224, 0.18)',
  xpGlow:     '0 0 28px 0 rgba(199, 244, 91,  0.22)',
} as const

/** Module metadata — used for coloring charts, chips, panel glows */
export const modules = {
  env: {
    label:   'Environmental',
    primary: colors.env.primary,
    glow:    colors.env.glow,
    shadow:  shadows.envGlow,
  },
  social: {
    label:   'Social',
    primary: colors.social.primary,
    glow:    colors.social.glow,
    shadow:  shadows.socialGlow,
  },
  gov: {
    label:   'Governance',
    primary: colors.gov.primary,
    glow:    colors.gov.glow,
    shadow:  shadows.govGlow,
  },
} as const

export type ModuleKey = keyof typeof modules
