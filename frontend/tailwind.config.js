/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        cyber: {
          navy: '#050b14',      // Deep navy base
          dark: '#0a1424',      // Card navy background
          blue: '#3b82f6',      // Electric blue secondary
          purple: '#8b5cf6',    // Cyber purple accent
          green: '#10b981',     // Neon green (healthy/normal)
          orange: '#f97316',    // Warning orange
          red: '#ef4444',       // Critical red
          gray: '#6b7280',
          lightGray: '#9ca3af',
        }
      },
      boxShadow: {
        'cyber-neon': '0 0 15px rgba(59, 130, 246, 0.4)',
        'cyber-purple': '0 0 15px rgba(139, 92, 246, 0.4)',
        'cyber-green': '0 0 15px rgba(16, 185, 129, 0.4)',
        'cyber-red': '0 0 15px rgba(239, 68, 68, 0.4)',
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
      }
    },
  },
  plugins: [],
}
