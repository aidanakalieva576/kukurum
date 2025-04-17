export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#748AA6',
        'darkprimary': '#5a708d'
      },
      gridTemplateColumns: {
        'auto': 'repeat(auto-fill, minmax(210px, 1fr))',
      },
      fontFamily: {
        sans: ["Jost", "serif"],
      },
    },
  },
  plugins: [],
};
