/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        "xl": "1.5rem",
        "2xl": "1.75rem",
        "3xl": "2rem",
        "4xl": "2.25rem",
      },
      colors: {
        "pink": "#F037A5",
        "pink-dark": "#ce0087",
        "blue": "#2D46B9",
        "blue-dark": "#1f2f6f",
        "red": "#FF748B",
        "rose": "#ffe4f9",
        "green": "#34D399"
      }
    },
   
  },
  plugins: [],
}

