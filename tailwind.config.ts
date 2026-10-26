import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        canvas: "#FDFBF7",
        paper: "#FFFFFF",
        charcoal: {
          900: "#14171A",
          800: "#1F2327",
          700: "#32373D",
          600: "#4D545C",
          500: "#6B7280",
          400: "#9CA3AF",
          300: "#D1D5DB",
          200: "#E5E7EB",
          100: "#F3F4F6",
          50: "#F9FAFB",
        },
        sage: {
          50: "#F3F8F5",
          100: "#E3EFE8",
          200: "#C5DEC9",
          300: "#9CC4A4",
          400: "#6EA67B",
          500: "#498959",
          600: "#386D45",
          700: "#2D5737",
          800: "#25452C",
          900: "#1E3924",
          accent: "#2A7249",
        },
        amber: {
          subtle: "#FEF7EE",
          border: "#F7D8A7",
          text: "#B45309",
        },
        rose: {
          subtle: "#FDF2F2",
          border: "#F8B4B4",
          text: "#B91C1C",
        },
        indigo: {
          subtle: "#F0F4FD",
          border: "#C7D7FD",
          text: "#3559E0",
        }
      },
      fontFamily: {
        serif: ["Newsreader", "Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 3px 1px rgba(0, 0, 0, 0.03)",
        card: "0 2px 8px -2px rgba(24, 27, 31, 0.05), 0 8px 24px -4px rgba(24, 27, 31, 0.08)",
        elevated: "0 12px 32px -4px rgba(24, 27, 31, 0.12), 0 4px 12px -2px rgba(24, 27, 31, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
