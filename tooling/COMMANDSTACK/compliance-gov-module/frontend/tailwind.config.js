/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1a3a5c',
          'navy-light': '#2a4f7a',
          'navy-dark': '#0f2640',
          teal: '#3d8eb9',
          'teal-light': '#5ba3c8',
          'teal-dark': '#2d7a9e',
        },
      },
    },
  },
  plugins: [],
}
