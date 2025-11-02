/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        baubau: {
          yellow: '#FFD700',
          'yellow-light': '#FFED4E',
          'yellow-dark': '#E6C200',
          blue: '#0066B3',
          'blue-light': '#1E88E5',
          'blue-dark': '#004D8C',
          green: '#2E7D32',
        },
        dark: {
          bg: '#0f172a',
          card: '#1e293b',
          border: '#334155',
        },
      },
    },
  },
  plugins: [],
};
