/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f4f7f4',
          100: '#e6ede6',
          200: '#d1ddd0',
          300: '#afc3ad',
          400: '#87a485',
          500: '#678a65',
          600: '#506f4e',
          700: '#405940',
          800: '#374b37',
          900: '#2e3e2e',
        },
        warm: {
          50: '#faf8f2',
          100: '#f2edd8',
          200: '#e6d9b0',
          300: '#d8c188',
          400: '#cba96b',
          500: '#c2985d',
          600: '#ad7c4c',
          700: '#8f6241',
          800: '#76503d',
          900: '#624337',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
