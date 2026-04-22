/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        yira: {
          blue: '#0055A4',
          orange: '#FF8200',
          green: '#009A44',
          dark: '#1e293b',
        }
      }
    },
  },
  plugins: [],
}