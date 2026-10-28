/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        svizz: {
          bg: 'var(--svizz-bg)',
          card: 'var(--svizz-card)',
          border: 'var(--svizz-border)',
          text: 'var(--svizz-text)',
          muted: 'var(--svizz-muted)',
          accent: 'var(--svizz-accent)',
          accentHover: 'var(--svizz-accent-hover)',
          accentMuted: 'var(--svizz-accent-muted)',
          glow: 'var(--svizz-glow)',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
        display: ['"Syne"', '"Cinzel"', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
        'glitch': 'glitch 0.3s ease-in-out',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
      }
    },
  },
  plugins: [],
}
