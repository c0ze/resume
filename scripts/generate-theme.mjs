// Generates client/src/theme.css — the four renditions of the record book.
// NEVER hand-edit the generated CSS; edit `themePalettes` below and re-run.
//
// The design system is "The Bound Notebook" (see DESIGN.md). Two inks on ruled
// stock, so a rendition is only seven values: the page, the tone step used for
// entry blocks and bands, the quad ruling, the printed hairline, the writing
// ink, the pencil used for metadata, and the correction red.
//
// Adding a token here is half a change: the other half is
// config/tailwind.config.cjs, which maps the token onto a utility.
import fs from 'fs';
import path from 'path';

const themePath = path.resolve(process.cwd(), 'config/theme.json');
const theme = JSON.parse(fs.readFileSync(themePath, 'utf-8'));
const defaultTheme = theme.appearance === 'dark' ? 'carbon-copy' : 'ruled';

const themePalettes = {
  // ── Ruled — the native rendition. Laboratory stock is a pale cool green-grey;
  //    cream, parchment and kraft are forbidden grounds (The Cool Stock Rule).
  ruled: {
    colorScheme: 'light',
    stock: '#EEF0EA',
    'stock-deep': '#E2E5DC',
    grid: '#C3C9BC',
    rule: '#8E9686',
    ink: '#1B2432',
    pencil: '#5C6470',
    red: '#A32B20',
  },

  // ── Ruled HC — the same sheet printed hard. Targets WCAG AAA: ink 17.3:1,
  //    pencil 10.6:1, correction red 9.4:1, printed hairline 9.0:1 on stock.
  'ruled-hc': {
    colorScheme: 'light',
    stock: '#F4F6F1',
    'stock-deep': '#E4E8DF',
    grid: '#AEB6A6',
    rule: '#3F4638',
    ink: '#0D1219',
    pencil: '#333A44',
    red: '#7E1A12',
  },

  // ── Carbon Copy — a carbon flimsy off the same desk, not an inversion of the
  //    page. Purple-black stock; carbon transfer reads violet-white, never
  //    neutral. The correction red is lifted so it survives on a dark ground —
  //    #A32B20 is 1.3:1 there, which would make the one real correction on the
  //    document invisible.
  'carbon-copy': {
    colorScheme: 'dark',
    stock: '#14131A',
    'stock-deep': '#1E1C26',
    grid: '#2E2B3A',
    rule: '#4A4658',
    ink: '#E8E4F0',
    pencil: '#918CA3',
    red: '#E2705F',
  },

  // ── Carbon Copy HC — the flimsy read under a lamp. Targets WCAG AAA:
  //    ink 18.1:1, pencil 11.1:1, correction red 9.7:1, hairline 5.7:1.
  'carbon-copy-hc': {
    colorScheme: 'dark',
    stock: '#0B0A10',
    'stock-deep': '#17151F',
    grid: '#332F42',
    rule: '#8C87A0',
    ink: '#F6F4FB',
    pencil: '#C4BFD6',
    red: '#FF9B8A',
  },
};

function buildThemeBlock(selector, variables) {
  const lines = Object.entries(variables)
    .filter(([name]) => name !== 'colorScheme')
    .map(([name, value]) => `  --${name}: ${value};`);

  lines.push(`  color-scheme: ${variables.colorScheme};`);
  // Paper does not have rounded corners. The token stays so the value has one
  // home, but every rendition ships radius 0.
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
