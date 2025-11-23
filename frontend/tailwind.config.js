/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#A8B8A5',
        secondary: '#E0E5D4',
        accent: '#C27C4A',
        background: '#FAF9F7',
        'background-dark': '#2E2C28',
        'text-primary': '#2F302F',
        'text-muted': '#8C8E8A',
        success: '#A8B8A5',
        error: '#C27C4A',
      }
    },
  },
  plugins: [],
}
