import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        card: "var(--color-card)",
        foreground: "var(--color-foreground)",
        "muted-foreground": "var(--color-muted-foreground)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        overlay: "var(--bg-overlay)",
        border: {
          subtle: "var(--border-subtle)",
          DEFAULT: "var(--border-default)",
          strong: "var(--border-strong)"
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)"
        },
        accent: {
          cyan: "var(--accent-cyan)",
          "cyan-dim": "var(--accent-cyan-dim)",
          amber: "var(--accent-amber)",
          "amber-dim": "var(--accent-amber-dim)",
          red: "var(--accent-red)",
          green: "var(--accent-green)",
          purple: "var(--accent-purple)"
        },
        node: {
          bg: "var(--node-bg)",
          border: "var(--node-border)",
          selected: "var(--node-selected)"
        }
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)"
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        cyan: "0 0 0 1px var(--accent-cyan), var(--shadow-md)"
      },
      fontFamily: {
        heading: ["var(--font-syne)", "sans-serif"],
        body: ["var(--font-dm-sans)", "sans-serif"]
      },
      fontSize: {
        xs: ["var(--text-xs)", { lineHeight: "1.4" }],
        sm: ["var(--text-sm)", { lineHeight: "1.5" }],
        base: ["var(--text-base)", { lineHeight: "1.6" }],
        lg: ["var(--text-lg)", { lineHeight: "1.5" }],
        xl: ["var(--text-xl)", { lineHeight: "1.3" }],
        "2xl": ["var(--text-2xl)", { lineHeight: "1.2" }],
        "3xl": ["var(--text-3xl)", { lineHeight: "1.1" }],
        hero: ["var(--text-hero)", { lineHeight: "1" }]
      },
      keyframes: {
        "mesh-drift": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(-2%, 2%, 0) scale(1.04)" }
        },
        "gradient-slide": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" }
        }
      },
      animation: {
        "mesh-drift": "mesh-drift 12s ease-in-out infinite",
        "gradient-slide": "gradient-slide 1.8s linear infinite"
      }
    }
  },
  plugins: []
}

export default config
