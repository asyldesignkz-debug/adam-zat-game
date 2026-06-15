import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        playful: ["Fredoka", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        "brand-blue": "#0ea5ff",
        "brand-green": "#22c55e",
        "brand-yellow": "#f59e0b",
        "brand-orange": "#fb923c",
        "brand-red": "#ef4444",
        "soft-cyan": "#e0f7fa",
      },
      borderRadius: {
        xl2: "1.5rem",
      },
      boxShadow: {
        playful: "0 10px 30px rgba(14,165,255,0.08), 0 4px 8px rgba(16,24,40,0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
