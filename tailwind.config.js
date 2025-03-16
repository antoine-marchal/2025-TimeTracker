/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark-bg': '#121212',
        'dark-surface': '#1e1e1e',
        'dark-border': '#2d2d2d',
        'dark-hover': '#2a2a2a',
        'dark-active': '#323232',
        'dark-text': '#e1e1e1',
        'dark-text-secondary': '#a1a1a1',
      },
    },
  },
  plugins: [],
};