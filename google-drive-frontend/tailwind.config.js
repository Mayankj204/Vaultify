/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#7F56D9',
        'background': '#F9FAFB',
        'border': '#E4E7EC',
        'text-primary': '#101828',
        'text-secondary': '#667085',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}