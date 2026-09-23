// Generates client/src/theme.css — the four renditions of the résumé.
// NEVER hand-edit the generated CSS; edit `themePalettes` below and re-run.
//
// The design system is "One Bit Forest", shared by the arda.tr family (see
// DESIGN.md here and DESIGN-SYSTEM.md one level up). Every site ships the same
// four rendition ids — xerox, xerox-hc, night, night-hc — in the same roles;
// the values are this site's. The résumé uses the family neutrals and its own
// signal: moss.
//
// A rendition is six colours plus the three the 1-bit canvases read:
//   bg        the ground
//   surface   raised panels (chat, dialog)
//   fg        ink
//   fg-2      muted ink: labels, dates, meta
//   rule      1px hairlines
//   signal    the phosphor — links, focus, the site mark. Never decoration.
//   ob-ink / ob-ground / ob-signal   read by client/src/lib/onebit.js (hex only)
//
// `role` is not emitted as a variable; scripts/check-theme-contract.mjs reads it
// and compares it with the arda.tr catalogue.
//
// Adding a token here is half a change: the other half is
// config/tailwind.config.cjs, which maps the token onto a utility.
import fs from 'fs';
import path from 'path';

const themePath = path.resolve(process.cwd(), 'config/theme.json');
const theme = JSON.parse(fs.readFileSync(themePath, 'utf-8'));
const defaultTheme = theme.appearance === 'dark' ? 'night' : 'xerox';

const themePalettes = {
  // ── Xerox — the default. Photocopy paper, black toner, moss ink for links.
  //    fg 16.0:1, fg-2 5.8:1, signal 6.8:1 on bg.
  xerox: {
    role: 'light',
    colorScheme: 'light',
    bg: '#efede6',
    surface: '#f7f6f1',
    fg: '#111210',
    'fg-2': '#5d5b55',
    rule: '#cfccc2',
    signal: '#2d5a39',
  },

  // ── Xerox HC — the same sheet, hard. Targets WCAG AAA throughout:
  //    fg 21:1, fg-2 13.6:1, signal 11.6:1, rule 17.4:1 on white.
  'xerox-hc': {
    role: 'hc-light',
    colorScheme: 'light',
    bg: '#ffffff',
    surface: '#ffffff',
    fg: '#000000',
    'fg-2': '#2e2e2e',
    rule: '#1a1a1a',
    signal: '#1d4028',
  },

  // ── Night — the family's dark ground, moss phosphor.
  //    fg 15.3:1, fg-2 7.1:1, signal 11.3:1 on bg.
  night: {
    role: 'dark',
    colorScheme: 'dark',
    bg: '#060708',
    surface: '#0d0f10',
    fg: '#e4e0d4',
    'fg-2': '#9d998e',
    rule: '#22252a',
    signal: '#8fd19e',
  },

  // ── Night HC — targets WCAG AAA: fg 21:1, fg-2 13.2:1, signal 14.7:1,
  //    rule 6.1:1 on black.
  'night-hc': {
    role: 'hc-dark',
    colorScheme: 'dark',
    bg: '#000000',
    surface: '#000000',
    fg: '#ffffff',
    'fg-2': '#d0cdc4',
    rule: '#8a8a8a',
    signal: '#a8e6b6',
  },
};

// The canvas palette for the résumé: pixels on = ink, off = ground, accent = signal.
const canvasPalette = (p) => ({
  'ob-ink': p.fg,
  'ob-ground': p.bg,
  'ob-signal': p.signal,
});

function buildThemeBlock(selector, palette) {
  const { role: _role, colorScheme, ...colours } = palette;
  const lines = Object.entries({ ...colours, ...canvasPalette(palette) }).map(
    ([name, value]) => `  --${name}: ${value};`
  );

  lines.push(`  color-scheme: ${colorScheme};`);
  // Radius 0 everywhere. The token stays so the value has one home.
  lines.push(`  --radius: ${theme.radius}rem;`);

  return `${selector} {\n${lines.join('\n')}\n}`;
}

const banner = [
  '/* GENERATED FILE — do not edit.',
  '   Source: scripts/generate-theme.mjs (themePalettes) + config/theme.json.',
  '   Run `node scripts/generate-theme.mjs` after changing either. */',
].join('\n');

const cssVariables = [
  banner,
  buildThemeBlock(`:root,\n.${defaultTheme}`, themePalettes[defaultTheme]),
  ...Object.entries(themePalettes)
    .filter(([id]) => id !== defaultTheme)
    .map(([id, palette]) => buildThemeBlock(`.${id}`, palette)),
].join('\n\n');

const outputPath = path.resolve(process.cwd(), 'client/src/theme.css');
fs.writeFileSync(outputPath, `${cssVariables}\n`);

console.log('Theme CSS generated successfully!');
