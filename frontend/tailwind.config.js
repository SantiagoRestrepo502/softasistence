/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        senaGreen: '#39A900', // Verde institucional SENA
      },
    },
  },
  plugins: [],
}

