// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  darkMode: ["class"],

  theme: {
    extend: {
      colors: {},
    },
  },

  plugins: [require("tailwindcss-animate")],
};
