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
    background: '0 0% 100%',
    foreground: '20 14.3% 4.1%',
    muted: '60 4.8% 95.9%',
    'muted-foreground': '25 5.3% 44.7%',
    popover: '0 0% 100%',
    'popover-foreground': '20 14.3% 4.1%',
    card: '0 0% 100%',
    'card-foreground': '20 14.3% 4.1%',
    border: '20 5.9% 90%',
    input: '20 5.9% 90%',
    primary: hslToCssHsl(theme.primary),
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
    foreground: '60 9.1% 97.8%',
    muted: '12 6.5% 15.1%',
    'muted-foreground': '24 5.4% 63.9%',
    popover: '20 14.3% 4.1%',
    'popover-foreground': '60 9.1% 97.8%',
    card: '20 14.3% 4.1%',
    'card-foreground': '60 9.1% 97.8%',
    border: '12 6.5% 15.1%',
    input: '12 6.5% 15.1%',
    primary: hslToCssHsl(theme.primary),
    'primary-foreground': '210 40% 98%',
    secondary: '12 6.5% 15.1%',
    'secondary-foreground': '60 9.1% 97.8%',
    accent: '12 6.5% 15.1%',
    'accent-foreground': '60 9.1% 97.8%',
    destructive: '0 62.8% 30.6%',
    'destructive-foreground': '60 9.1% 97.8%',
    ring: '12 6.5% 15.1%',
  },
  dracula: {
    colorScheme: 'dark',
    background: '252 18% 15%',
    foreground: '60 30% 96%',
    muted: '252 18% 22%',
    'muted-foreground': '252 15% 55%',
    popover: '252 18% 18%',
    'popover-foreground': '60 30% 96%',
    card: '252 18% 18%',
    'card-foreground': '60 30% 96%',
    border: '252 18% 28%',
    input: '252 18% 28%',
    primary: '265 89% 75%',
    'primary-foreground': '252 18% 15%',
    secondary: '252 18% 22%',
    'secondary-foreground': '60 30% 96%',
    accent: '265 89% 75%',
    'accent-foreground': '252 18% 15%',
    destructive: '10 100% 75%',
    'destructive-foreground': '252 18% 15%',
    ring: '265 89% 75%',
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
