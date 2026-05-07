/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        golf: {
          green: '#1a4731',
          'green-light': '#2d6a4f',
          'green-dark': '#0f2e20',
          gold: '#f0c040',
          'gold-dark': '#d4a800',
          fairway: '#4a7c59',
          sand: '#e8d5a3',
          water: '#4a90d9',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
