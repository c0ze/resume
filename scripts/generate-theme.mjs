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
  dracula: {
    colorScheme: 'dark',
    background: '252 18% 13%',
    foreground: '60 30% 94%',
    muted: '252 18% 20%',
    'muted-foreground': '252 12% 64%',
    popover: '252 18% 16%',
    'popover-foreground': '60 30% 94%',
    card: '252 18% 16%',
    'card-foreground': '60 30% 94%',
    border: '252 16% 26%',
    input: '252 16% 26%',
    primary: '265 89% 78%',
    'primary-foreground': '252 25% 10%',
    secondary: '252 18% 20%',
    'secondary-foreground': '60 30% 94%',
    accent: '265 89% 78%',
    'accent-foreground': '252 25% 10%',
    destructive: '10 100% 72%',
    'destructive-foreground': '252 25% 10%',
    ring: '265 89% 78%',
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
  buildThemeBlock('.dracula', themePalettes.dracula),
].join('\n\n');

const outputPath = path.resolve(process.cwd(), 'client/src/theme.css');
fs.writeFileSync(outputPath, cssVariables);

console.log('Theme CSS generated successfully!');
