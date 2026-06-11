import fs from 'fs';
import path from 'path';

const themePath = path.resolve(process.cwd(), 'config/theme.json');
const theme = JSON.parse(fs.readFileSync(themePath, 'utf-8'));
const defaultTheme = theme.appearance === 'dark' ? 'van-helsing' : 'alucard';

function hslToCssHsl(hsl) {
  if (!hsl) return '';
  const [h, s, l] = hsl.match(/\d+/g);
  return `${h} ${s}% ${l}%`;
}

const themePalettes = {
  alucard: {
    colorScheme: 'light',
    background: '30 10% 98%',
    foreground: '20 14.3% 4.1%',
    muted: '60 4.8% 95.9%',
    'muted-foreground': '25 8% 38%',
    popover: '0 0% 100%',
    'popover-foreground': '20 14.3% 4.1%',
    card: '0 0% 100%',
    'card-foreground': '20 14.3% 4.1%',
    border: '20 6% 85%',
    input: '20 6% 85%',
    primary: '216 55% 22%',
    'primary-foreground': '210 40% 98%',
    secondary: '60 4.8% 95.9%',
    'secondary-foreground': '24 9.8% 10%',
    accent: '60 4.8% 95.9%',
    'accent-foreground': '24 9.8% 10%',
    destructive: '0 84.2% 60.2%',
    'destructive-foreground': '60 9.1% 97.8%',
    ring: '20 14.3% 4.1%',
  },
  'van-helsing': {
    colorScheme: 'dark',
    background: '20 14.3% 4.1%',
    foreground: '40 10% 92%',
    muted: '12 6.5% 12%',
    'muted-foreground': '30 6% 68%',
    popover: '20 10% 7%',
    'popover-foreground': '40 10% 92%',
    card: '20 10% 7%',
    'card-foreground': '40 10% 92%',
    border: '20 6% 18%',
    input: '20 6% 18%',
    primary: '216 50% 58%',
    'primary-foreground': '216 50% 8%',
    secondary: '12 6.5% 12%',
    'secondary-foreground': '40 10% 92%',
    accent: '12 6.5% 12%',
    'accent-foreground': '40 10% 92%',
    destructive: '0 62.8% 55%',
    'destructive-foreground': '0 0% 100%',
    ring: '216 50% 58%',
  },
  paper: {
    // High-contrast light: the resume's navy ink at AAA depth, no soft chrome.
    colorScheme: 'light',
    background: '0 0% 100%',
    foreground: '0 0% 4%',
    muted: '0 0% 94%',
    'muted-foreground': '0 0% 24%',
    popover: '0 0% 100%',
    'popover-foreground': '0 0% 4%',
    card: '0 0% 100%',
    'card-foreground': '0 0% 4%',
    border: '0 0% 32%',
    input: '0 0% 32%',
    primary: '216 80% 20%',
    'primary-foreground': '0 0% 100%',
    secondary: '0 0% 94%',
    'secondary-foreground': '0 0% 4%',
    accent: '216 80% 20%',
    'accent-foreground': '0 0% 100%',
    destructive: '0 90% 30%',
    'destructive-foreground': '0 0% 100%',
    ring: '216 80% 20%',
  },
  carbon: {
    // High-contrast dark: bright steel-blue ink on near-black.
    colorScheme: 'dark',
    background: '0 0% 2%',
    foreground: '0 0% 98%',
    muted: '0 0% 12%',
    'muted-foreground': '0 0% 80%',
    popover: '0 0% 5%',
    'popover-foreground': '0 0% 98%',
    card: '0 0% 5%',
    'card-foreground': '0 0% 98%',
    border: '0 0% 52%',
    input: '0 0% 52%',
    primary: '213 95% 78%',
    'primary-foreground': '0 0% 2%',
    secondary: '0 0% 12%',
    'secondary-foreground': '0 0% 98%',
    accent: '213 95% 78%',
    'accent-foreground': '0 0% 2%',
    destructive: '0 100% 80%',
    'destructive-foreground': '0 0% 2%',
    ring: '213 95% 78%',
  },
};

function buildThemeBlock(selector, variables) {
  const lines = Object.entries(variables)
    .filter(([name]) => name !== 'colorScheme')
    .map(([name, value]) => `  --${name}: ${value};`);

  lines.push(`  color-scheme: ${variables.colorScheme};`);
  lines.push(`  --radius: ${theme.radius}rem;`);

  return `${selector} {\n${lines.join('\n')}\n}`;
}

const defaultSelector = `:root,\n.${defaultTheme}`;
const secondaryThemeSelector = defaultTheme === 'alucard' ? '.van-helsing' : '.alucard';

const cssVariables = [
  buildThemeBlock(defaultSelector, themePalettes[defaultTheme]),
  buildThemeBlock(secondaryThemeSelector, themePalettes[secondaryThemeSelector.slice(1)]),
  buildThemeBlock('.paper', themePalettes.paper),
  buildThemeBlock('.carbon', themePalettes.carbon),
].join('\n\n');

const outputPath = path.resolve(process.cwd(), 'client/src/theme.css');
fs.writeFileSync(outputPath, cssVariables);

console.log('Theme CSS generated successfully!');
