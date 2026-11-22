/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        naqi: {
          good: '#00B050',
          satisfactory: '#92D050',
          moderate: '#E5B800',
          poor: '#FF7C80',
          verypoor: '#D32F2F',
          severe: '#7B1FA2',
        },
      },
    },
  },
  plugins: [],
}
