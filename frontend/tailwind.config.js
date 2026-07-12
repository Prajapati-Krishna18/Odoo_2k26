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
      colors: {
        bg: {
          void:         '#0B120E',   // primary background
          surface:      '#131F19',   // panel background
          'surface-raised': '#1B2B22', // elevated panel / hover
        },
        border: {
          soft:         '#24382C',   // subtle borders
        },
        text: {
          primary:      '#EDF3EA',
          muted:        '#8FA396',
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
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"Space Mono"', '"Courier New"', 'monospace'],
      },
    },
  },
  plugins: [],
}
