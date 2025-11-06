// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  darkMode: ["class"],

  theme: {
    extend: {
      colors: {
        "blackshark-primary": "#FFFFFF",
        "blackshark-background": "#010001",
        "blackshark-card": "#1a1a1a",
        "blackshark-accent": "#64748b",
        "blackshark-destructive": "#ef4444",

        background: "var(--color-background, #010001)",
        foreground: "var(--color-foreground, #FFFFFF)",
        card: "var(--color-card, #1a1a1a)",
        "card-foreground": "var(--color-card-foreground, #FFFFFF)",
        primary: "var(--color-primary, #FFFFFF)",
        "primary-foreground": "var(--color-primary-foreground, #010001)",
        secondary: "var(--color-secondary, #1a1a1a)",
        destructive: "var(--color-destructive, #ef4444)",
      },
      borderRadius: {
        lg: "0px",
        md: "0px",
        sm: "0px",
      },
    },
  },

  plugins: [require("tailwindcss-animate")],
};
