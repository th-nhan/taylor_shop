/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          dark: '#0F172A',      // Slate 900
          navy: '#1E1B4B',      // Indigo 950
          indigo: '#3730A3',    // Indigo 800
          accent: '#D97706',    // Amber 600
          accentLight: '#F59E0B',
          bg: '#F8FAFC',
          card: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
