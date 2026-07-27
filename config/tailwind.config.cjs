const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");

/**
 * "The Bound Notebook" (see DESIGN.md).
 *
 * Colour tokens are raw hex emitted per rendition by scripts/generate-theme.mjs.
 * They are deliberately *not* channel-split for Tailwind's `<alpha-value>`
 * slot: the system has exactly two inks and emphasis is a doubled rule or a
 * tone step, never a tint. If you reach for `text-ink/60`, reach for
 * `text-pencil` instead.
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
        // Morisawa BIZ UD — Japanese universal-design *business document*
        // faces. One system covers CJK, Latin and latin-ext (Turkish).
        gothic: ['"BIZ UDPGothic"', '"Hiragino Kaku Gothic ProN"', "Meiryo", "sans-serif"],
        mincho: ['"BIZ UDPMincho"', '"Hiragino Mincho ProN"', '"Yu Mincho"', "serif"],
      },
      colors: {
        stock: "var(--stock)",
        "stock-deep": "var(--stock-deep)",
        grid: "var(--grid)",
        rule: "var(--rule)",
        ink: "var(--ink)",
        pencil: "var(--pencil)",
        red: "var(--red)",
      },
      borderColor: {
        DEFAULT: "var(--rule)",
      },
      spacing: {
        // The 5mm quad is the layout grid. --q is pinned to the browser's real
        // 5mm at runtime so laid-out blocks and the painted ruling share one
        // number (see index.css / Quad.res).
        q: "var(--q)",
        q2: "calc(var(--q) * 2)",
        q3: "calc(var(--q) * 3)",
        q4: "calc(var(--q) * 4)",
        q6: "calc(var(--q) * 6)",
        spine: "var(--spine)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "var(--radius)",
        sm: "var(--radius)",
      },
    },
  },
  plugins: [],
};
