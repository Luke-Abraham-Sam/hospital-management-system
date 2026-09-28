/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0284c7',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
        healthcare: {
          blue: '#0284c7',
          teal: '#0d9488',
          emerald: '#059669',
          amber: '#d97706',
          rose: '#e11d48'
        }
      }
    },
  },
  plugins: [],
}
