/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Peach/Spring color palette
        primary: {
          50: '#fef7f0',
          100: '#fdeee0',
          200: '#fbdac1',
          300: '#f7c196',
          400: '#f2a069',
          500: '#ee8447',
          600: '#e06d37',
          700: '#ba5930',
          800: '#944a2f',
          900: '#78402a',
          950: '#412015',
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        accent: {
          50: '#fff9f5',
          100: '#fff2eb',
          200: '#ffdecb',
          300: '#ffc29b',
          400: '#ff9d5a',
          500: '#ff7b19',
          600: '#e85d00',
          700: '#c44a00',
          800: '#9c3a00',
          900: '#7d2e00',
          950: '#3d1600',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        '4xl': '2rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
} 