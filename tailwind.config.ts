import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#f6f7f9",
        card: "#ffffff",
        ink: "#141a26",
        low: "#22c55e",
        med: "#f59e0b",
        high: "#ef4444"
      }
    }
  },
  plugins: []
};

export default config;
