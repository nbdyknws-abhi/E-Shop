export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'fill-bar': {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        'move-image': {
          '0%': { left: '0%' },
          '100%': { left: '100%' },
        },
      },
      animation: {
        'fill-bar': 'fill-bar 2s ease-in-out forwards',
        'move-image': 'move-image 2s ease-in-out forwards',
      },
    },
  },
  plugins: [],
};
