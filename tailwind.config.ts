import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#eef9ff",
          100: "#d8f1ff",
          200: "#bae7ff",
          300: "#8adaff",
          400: "#52c3ff",
          500: "#2aa5ff",
          600: "#1488f5",
          700: "#0d6fe1",
          800: "#1259b6",
          900: "#154c8f",
          950: "#122f57",
        },
        emerald: {
          400: "#34d399",
          500: "#10b981",
        },
        surface: {
          DEFAULT: "rgba(15, 23, 42, 0.8)",
          light: "rgba(30, 41, 59, 0.6)",
          dark: "rgba(2, 6, 23, 0.9)",
        },
      },
      fontFamily: {
        serif: ["DM Serif Display", "serif"],
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
