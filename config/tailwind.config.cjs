const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");

/**
 * The category standard at full craft (see DESIGN.md).
 *
 * Colour tokens are raw hex emitted per rendition by scripts/generate-theme.mjs.
 * They are deliberately *not* channel-split for Tailwind's `<alpha-value>`
 * slot: the system has one accent and two text weights, and a tint of the text
 * colour is how a clean palette turns into six undocumented greys. If you reach
 * for `text-text/60`, reach for `text-muted` instead.
 *
 * A new token is a two-file change: the generator plus this file.
 */
module.exports = {
  darkMode: ["class"],
  content: [
    path.resolve(projectRoot, "client/index.html"),
    path.resolve(projectRoot, "client/src/**/*.{res,js,jsx,ts,tsx}"),
  ],
  theme: {
    extend: {
      fontFamily: {
        // M PLUS 2 — one family covers CJK, Latin and the Turkish latin-ext
        // glyphs. Chosen by testing what the browser actually paints with:
        // several JP families declare the latin-ext range but ship no Ş/ğ/İ and
        // fall back to a serif mid-word. See the note in client/index.html.
        sans: ['"M PLUS 2"', '"Hiragino Kaku Gothic ProN"', "Meiryo", "system-ui", "sans-serif"],
      },
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        border: "var(--border)",
        text: "var(--text)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        "accent-contrast": "var(--accent-contrast)",
      },
      borderColor: {
        DEFAULT: "var(--border)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "var(--radius)",
        sm: "var(--radius-sm)",
        xs: "var(--radius-xs)",
      },
      maxWidth: {
        page: "44rem",
        measure: "38rem",
      },
    },
  },
  plugins: [],
};
