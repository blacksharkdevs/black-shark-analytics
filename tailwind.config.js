// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  darkMode: ["class"],

  theme: {
    extend: {
      colors: {
        // Fundo e Texto
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Cards e Sidebar
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",

        // Cores de Ação (Botões/Destaque)
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",

        // Borda, Accent, Destructive
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",

        // Cores mutáveis para inputs/borda (se você tiver)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        // Mantemos 0px para o design reto!
        lg: "0px",
        md: "0px",
        sm: "0px",
      },
    },
  },

  plugins: [require("tailwindcss-animate")],
};
