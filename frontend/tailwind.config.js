/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        darkBg: '#0f172a',     // Deep slate blue
        darkCard: '#1e293b',   // Slate blue card
        accentNeon: '#10b981', // Emerald green
        accentPurple: '#8b5cf6', // Violet
        accentRose: '#f43f5e',  // Rose pink
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
