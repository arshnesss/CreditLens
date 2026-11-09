/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070B19',
          900: '#0B132B',
          800: '#152042',
          700: '#1C2E5D',
          600: '#284282',
        },
        fintech: {
          blue: '#1E40AF',
          cyan: '#0284C7',
          emerald: '#059669',
          amber: '#D97706',
          rose: '#E11D48',
          card: '#FFFFFF',
          bg: '#F8FAFC',
          border: '#E2E8F0',
          textMuted: '#64748B',
          textDark: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

