// Generates client/src/theme.css — the four renditions of the résumé.
// NEVER hand-edit the generated CSS; edit `themePalettes` below and re-run.
//
// The design system is the category standard executed at full craft (see
// DESIGN.md). It is a neutral surface with exactly one accent, so a rendition
// is seven values: the page, the inset surface, the hairline, the primary text,
// the secondary text, the accent, and the text that sits on the accent.
//
// Adding a token here is half a change: the other half is
// config/tailwind.config.cjs, which maps the token onto a utility.
import fs from 'fs';
import path from 'path';

const themePath = path.resolve(process.cwd(), 'config/theme.json');
const theme = JSON.parse(fs.readFileSync(themePath, 'utf-8'));
const defaultTheme = theme.appearance === 'dark' ? 'dark' : 'light';

const themePalettes = {
  // ── Light — the native rendition. A résumé is read under office light, on a
  //    laptop mid-screening call and on a phone, and it is printed. White is
  //    the honest ground for all three; the warm-paper grounds a résumé design
  //    reaches for by reflex cost legibility and print fidelity for nothing.
  light: {
    colorScheme: 'light',
    bg: '#FFFFFF',
    surface: '#F7F8F9',
    border: '#E3E5E8',
    text: '#15171A', // 18.0:1
    muted: '#646A72', // 5.5:1
    accent: '#0D6E79', // 6.0:1
    'accent-contrast': '#FFFFFF',
  },

  // ── Light HC — the same page under a harder light. Targets WCAG AAA:
  //    text 21:1, muted 10.5:1, accent 9.1:1, and hairlines lifted to 3.2:1 so
  //    the structure survives for a reader who needs the contrast.
  'light-hc': {
    colorScheme: 'light',
    bg: '#FFFFFF',
    surface: '#F1F3F4',
    border: '#8A9098',
    text: '#000000',
    muted: '#3A4046',
    accent: '#08505A',
    'accent-contrast': '#FFFFFF',
  },

  // ── Dark — read at night, or by anyone whose whole desktop is dark. Not an
  //    inversion: the ground is a cool near-black that keeps the accent
  //    readable, and the accent lifts because #0D6E79 on near-black is 1.9:1.
  dark: {
    colorScheme: 'dark',
    bg: '#0E1013',
    surface: '#171A1E',
    border: '#282C31',
    text: '#EDEFF2', // 16.5:1
    muted: '#9BA3AC', // 7.5:1
    accent: '#4FC3D0', // 9.1:1
    'accent-contrast': '#0E1013',
  },

  // ── Dark HC — the dark page under a harder light. Targets WCAG AAA:
  //    text 21:1, muted 13.5:1, accent 14.1:1, hairlines 3.5:1.
  'dark-hc': {
    colorScheme: 'dark',
    bg: '#000000',
    surface: '#121417',
    border: '#5C646C',
    text: '#FFFFFF',
    muted: '#C9D0D7',
    accent: '#7FE3EE',
    'accent-contrast': '#000000',
  },
};

function buildThemeBlock(selector, variables) {
  const lines = Object.entries(variables)
    .filter(([name]) => name !== 'colorScheme')
    .map(([name, value]) => `  --${name}: ${value};`);

  lines.push(`  color-scheme: ${variables.colorScheme};`);
  // One authored radius plus two named derivations. The steps are tokens rather
  // than inline `calc(var(--radius) * 0.6)` at each call site, so the ramp has
  // one home and a reader can see the whole scale in the generated file.
  lines.push(`  --radius: ${theme.radius}rem;`);
  lines.push(`  --radius-sm: ${+(theme.radius * 0.6).toFixed(4)}rem;`);
  lines.push(`  --radius-xs: ${+(theme.radius * 0.5).toFixed(4)}rem;`);

  return `${selector} {\n${lines.join('\n')}\n}`;
}

const banner = [
  '/* GENERATED FILE — do not edit.',
  '   Source: scripts/generate-theme.mjs (themePalettes) + config/theme.json.',
  '   Run `node scripts/generate-theme.mjs` after changing either. */',
].join('\n');

// `.dark` and `.dark-hc` are both applied to <html> for the high-contrast dark
// rendition (the plain `dark` class is what Tailwind's dark: variant keys off),
// so `.dark-hc` has to be emitted after `.dark` to win at equal specificity.
const order = ['light', 'light-hc', 'dark', 'dark-hc'];

const cssVariables = [
  banner,
  buildThemeBlock(`:root,\n.${defaultTheme}`, themePalettes[defaultTheme]),
  ...order
    .filter((id) => id !== defaultTheme)
    .map((id) => buildThemeBlock(`.${id}`, themePalettes[id])),
].join('\n\n');

const outputPath = path.resolve(process.cwd(), 'client/src/theme.css');
fs.writeFileSync(outputPath, `${cssVariables}\n`);

console.log('Theme CSS generated successfully!');
