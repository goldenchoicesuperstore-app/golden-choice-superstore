const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'splash-fade': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'splash-scale': {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        }
      },
      colors: {
        brand: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#F5C200', // Primary brand color
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'sans-serif'],
      },
      boxShadow: {
        'brand': '0 4px 14px 0 rgba(245, 194, 0, 0.39)',
      }
    },
  },
  plugins: [],
};

export default config;
