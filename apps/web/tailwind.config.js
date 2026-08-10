/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-main': '#15161b',
        'bg-card': '#1e1f24',
        'bg-hover': '#24262e',
        border: '#353740',
        brand: '#09bc8a',
        blue: '#60a5fa',
        yellow: '#fbbf24',
        red: '#ef4444',
        neutral: '#94a3b8',
        bronze: '#cd7f32',
        'text-primary': '#ffffff',
        'text-secondary': '#81869e',
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
