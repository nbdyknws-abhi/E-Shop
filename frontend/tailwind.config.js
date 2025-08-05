export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "fill-bar": {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        "move-image": {
          "0%": { left: "0%" },
          "100%": { left: "100%" },
        },
      },
      animation: {
        "fill-bar": "fill-bar 0.6s ease-out forwards", // Matches the 600ms loading time
        "move-image": "move-image 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};
