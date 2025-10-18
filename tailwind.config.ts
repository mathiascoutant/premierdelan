import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "gold-light": "#F4E5C2",
        gold: "#D4AF37",
        "gold-dark": "#B8941D",
        burgundy: "#6B1A3D",
        "burgundy-dark": "#4A1129",
        "burgundy-light": "#8B2350",
        brown: "#5C4033",
        "brown-dark": "#3E2A23",
        "parchment-light": "#FAF6ED",
        parchment: "#F5EFE0",
        "parchment-dark": "#E8DCC3",
        ink: "#1A1410",
        "ink-light": "#2D2419",
        stone: "#8B7D6B",
        "stone-light": "#C4B8A8",
      },
      fontFamily: {
        cinzel: ["var(--font-cinzel)", "serif"],
        crimson: ["var(--font-crimson)", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-in-out",
        "slide-up": "slideUp 0.8s ease-out",
        "slide-down": "slideDown 0.6s ease-out",
        shake: "shake 0.5s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-10px)" },
          "50%": { transform: "translateX(10px)" },
          "75%": { transform: "translateX(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
