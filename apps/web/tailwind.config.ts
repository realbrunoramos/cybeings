import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#04060D",
        deep: "#090E1C",
        surface: "#0D1526",
        panel: "#111D35",
        cyan: "#00E5FF",
        violet: "#8B5CF6",
        emerald: "#10B981",
        amber: "#F59E0B",
        coral: "#F97316",
      },
      fontFamily: {
        display: ["var(--font-syne)", "sans-serif"],
        body: ["var(--font-space-grotesk)", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
      },
      borderRadius: {
        DEFAULT: "6px",
        lg: "14px",
      },
    },
  },
  plugins: [],
};

export default config;
