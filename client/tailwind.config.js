/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          400: '#52adff', 500: '#2a8bff', 600: '#0d6afc',
          700: '#0654e8', 800: '#0c44bc', 900: '#103d94',
        },
        navy: { 700: '#0e1f38', 800: '#0a1628', 900: '#060f1d', 950: '#030912' },
        accent: { 400: '#38d9a9', 500: '#20c997', 600: '#12b886' },
      },
      fontFamily: {
        display: ['"Clash Display"', 'sans-serif'],
        body: ['"Cabinet Grotesk"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
