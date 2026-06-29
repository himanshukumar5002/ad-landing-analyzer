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
        darkBg: '#f8fafc',     // Light background
        darkCard: '#ffffff',   // White card
        accentNeon: '#10b981', // Emerald green
        accentPurple: '#4f46e5', // Royal Indigo
        accentRose: '#ef4444',  // Rose red
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
