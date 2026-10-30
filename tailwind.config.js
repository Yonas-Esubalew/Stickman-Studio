/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0b0f13',
        panel: '#12181e',
        aqua: '#65e6d3',
      },
    },
  },
  plugins: [],
}
