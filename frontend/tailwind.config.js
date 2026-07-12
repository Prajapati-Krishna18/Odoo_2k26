/** @type {import('tailwindcss').Config} */
/**
 * ─────────────────────────────────────────────────────────────────
 * NOTE: Tailwind CSS v4 uses a CSS-first config model.
 * The canonical token definitions live in src/global.css under @theme.
 * This file is provided as a design reference and for any legacy
 * tooling / IDE IntelliSense that reads tailwind.config.js.
 *
 * Tailwind v4 does NOT read this file automatically.
 * ─────────────────────────────────────────────────────────────────
 */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ── Color Palette ──────────────────────────────────────────
      colors: {
        bg: {
          void:         '#0B120E',   // primary background, near-black forest
          surface:      '#131F19',   // panel background
          'surface-raised': '#1B2B22', // elevated panel / hover
        },
        border: {
          soft:         '#24382C',   // subtle borders, low contrast
        },
        text: {
          primary:      '#EDF3EA',
          muted:        '#8FA396',
        },

        // Environmental
        env: {
          primary:      '#2FA66B',
          glow:         '#7FE3A8',
        },

        // Social
        social: {
          primary:      '#E3A857',
          glow:         '#F5CE8C',
        },

        // Governance
        gov: {
          primary:      '#4869A6',
          glow:         '#8FB0E0',
        },

        // Gamification / XP — NEVER use for E/S/G data
        xp: {
          accent:       '#C7F45B',
        },

        // Danger
        danger:         '#E06258',
      },

      // ── Typography ─────────────────────────────────────────────
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"Space Mono"', '"Courier New"', 'monospace'],
      },

      fontWeight: {
        'display-normal': '600',
        'display-bold':   '800',
      },

      letterSpacing: {
        'display': '-0.03em',
        'data':    '-0.01em',
      },

      // ── Border Radius (organic / irregular feel) ────────────────
      borderRadius: {
        'panel':    '24px',
        'panel-sm': '20px',
        'panel-lg': '28px',
        'chip':     '10px',
        'btn':      '12px',
      },

      // ── Box Shadows (soft, diffused — NO hard drops) ────────────
      boxShadow: {
        'soft':        '0 4px 24px 0 rgba(0, 0, 0, 0.35)',
        'panel':       '0 8px 40px 0 rgba(0, 0, 0, 0.40)',
        'env-glow':    '0 0 28px 0 rgba(127, 227, 168, 0.18)',
        'social-glow': '0 0 28px 0 rgba(245, 206, 140, 0.18)',
        'gov-glow':    '0 0 28px 0 rgba(143, 176, 224, 0.18)',
        'xp-glow':     '0 0 28px 0 rgba(199, 244, 91,  0.22)',
      },

      // ── Animations ─────────────────────────────────────────────
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
      },
      animation: {
        'fade-up':    'fade-up 0.4s ease forwards',
        'fade-in':    'fade-in 0.3s ease forwards',
        'glow-pulse': 'glow-pulse 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
