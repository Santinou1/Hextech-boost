/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#00d1b5",
        "accent-gold": "#C89B3C",
        "hextech-gold": "#C89B3C",
        "background-light": "#f4f5f5",
        "background-dark": "#0a0f15",
        "hextech-dark": "#0b0e11",
        "hextech-surface": "#1A1E24",
        "hex-surface": "#131a1e",
        "hextech-border": "#204b45",
        "hex-border": "#204b45",
        "border-cyan": "#204b45",
        "panel-dark": "#141b1a",
        "card-dark": "#121a1d",
        "surface-dark": "#151A21",
        "emerald-glow": "#50C878",
        "diamond-glow": "#00eeff",
        "master-glow": "#a335ee",
        "gm-glow": "#ff4e50",
        "challenger-glow": "#f0f9ff"
      },
      fontFamily: {
        "display": ["Space Grotesk", "sans-serif"],
        "body": ["Noto Sans", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
    },
  },
  plugins: [],
}
