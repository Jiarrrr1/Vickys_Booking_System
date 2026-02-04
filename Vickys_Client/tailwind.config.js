/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0966c8',
        secondary: '#1F7F52',
        accent: '#007A56',
        dark: '#323232',
        light: '#F0F0F0',
        gray: {
          100: '#F0F0F0',
          200: '#DADADA',
          300: '#C0C0C0',
          400: '#A0A0A0',
          500: '#595959',
          600: '#4C4C4C',
          700: '#333333',
        }
      },
      fontFamily: {
        'madi': ['"Ms Madi"', 'cursive'],
        'montserrat': ['Montserrat', 'sans-serif'],
        'noto-sans': ['Noto Sans', 'sans-serif'],
        'playfair': ['Playfair', 'serif'],
        'playfair-display': ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}