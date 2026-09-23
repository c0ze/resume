const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");

/**
 * "One Bit Forest" (see DESIGN.md).
 *
 * Tailwind supplies the reset and a handful of layout utilities; almost all of
 * the visual system lives in client/src/index.css as plain CSS over the tokens.
 *
 * Colour tokens are raw hex emitted per rendition by scripts/generate-theme.mjs.
 * They are deliberately *not* channel-split for Tailwind's `<alpha-value>`
 * slot: the system is one bit plus one signal, and emphasis is weight, size or
 * a 1px rule, never a tint. If you reach for `text-fg/60`, use `text-fg-2`.
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
        display: ['"Big Shoulders Display"', '"Arial Narrow"', "sans-serif"],
        sans: ['"IBM Plex Sans"', '"IBM Plex Sans JP"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', '"IBM Plex Sans JP"', "ui-monospace", "monospace"],
        jp: ['"IBM Plex Sans JP"', '"IBM Plex Sans"', "sans-serif"],
      },
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        fg: "var(--fg)",
        "fg-2": "var(--fg-2)",
        rule: "var(--rule)",
        signal: "var(--signal)",
      },
      borderColor: {
        DEFAULT: "var(--rule)",
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
