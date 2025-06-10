/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f6f7f6',
          100: '#e3e8e3',
          200: '#c7d2c7',
          300: '#9fb09f',
          400: '#7a8f7a',
          500: '#5d735d',
          600: '#4a5a4a',
          700: '#3d4a3d',
          800: '#333c33',
          900: '#2b322b',
        },
        warm: {
          50: '#fefcf9',
          100: '#fef7ed',
          200: '#fcecd4',
          300: '#f9ddb1',
          400: '#f5c77e',
          500: '#f0a855',
          600: '#e18c2e',
          700: '#bc6f1f',
          800: '#96561c',
          900: '#78471b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};