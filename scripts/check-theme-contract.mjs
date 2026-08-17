// Checks that every theme this site ships maps by NAME into the canonical
// 9-theme catalogue published by the arda.tr portfolio repo.
//
// The resume deliberately carries a navy-inked professional SUBSET of that
// catalogue, so palette VALUES differ by design — only the display names
// must exist among the canonical names. Local ids may also differ from
// canonical ids (e.g. `dracula` vs `dracula-pro`), hence the name comparison.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const contractUrl = 'https://raw.githubusercontent.com/c0ze/arda.tr/main/config/themes.json';

// Local display names that deliberately differ from the canonical catalogue.
//
// This site's renditions are named for what they are, because the design system
// is the category standard executed at full craft (see DESIGN.md) and naming a
// light mode anything other than "Light" would be exactly the invented
// vocabulary it refuses. The canonical catalogue names the same four *roles* —
// light, high-contrast light, dark, high-contrast dark — after its own world.
// The mapping below is the contract: the roles line up one-for-one, the words
// do not, and the words are owned by each site's design system.
const localToCanonicalName = {
  Light: 'Stock',
  'Light HC': 'Stock HC',
  Dark: 'Microfiche',
  'Dark HC': 'Microfiche HC',
};

async function loadContract() {
  const localPath = process.env.THEMES_CONTRACT_PATH;
  if (localPath) {
    console.log(`Loading theme contract from ${localPath}`);
    return JSON.parse(fs.readFileSync(localPath, 'utf8'));
  }

  console.log(`Fetching theme contract from ${contractUrl}`);
  try {
    const response = await fetch(contractUrl);
    if (!response.ok) {
      console.warn(`Warning: contract fetch failed (HTTP ${response.status}) — skipping check.`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.warn(`Warning: contract fetch failed (${error.message}) — skipping check.`);
    return null;
  }
}

// Local theme ids are the top-level keys of `themePalettes` in generate-theme.mjs.
function readLocalThemeIds() {
  const source = fs.readFileSync(path.join(projectRoot, 'scripts', 'generate-theme.mjs'), 'utf8');
  const block = source.match(/const themePalettes = \{([\s\S]*?)\n\};/);
  if (!block) throw new Error('Could not find themePalettes in scripts/generate-theme.mjs');

  return [...block[1].matchAll(/^ {2}(?:'([\w-]+)'|([\w$]+)):\s*\{/gm)].map(
    (match) => match[1] ?? match[2]
  );
}

// Human-readable theme names live in the `themeInfos` catalogue in ThemeToggle.res.
function readLocalThemeNames() {
  const source = fs.readFileSync(
    path.join(projectRoot, 'client', 'src', 'components', 'ThemeToggle.res'),
    'utf8'
  );
  const names = [...source.matchAll(/\{id:\s*(?:ThemeContext\.)?\w+,\s*name:\s*"([^"]+)"/g)].map(
    (match) => match[1]
  );
  if (names.length === 0) throw new Error('Could not find themeInfos names in ThemeToggle.res');
  return names;
}

async function check() {
  const contract = await loadContract();
  if (!contract) process.exit(0);

  const canonicalNames = new Set(contract.themes.map((theme) => theme.name));
  const localIds = readLocalThemeIds();
  const localNames = readLocalThemeNames();

  console.log(`Canonical catalogue (v${contract.version}): ${[...canonicalNames].join(', ')}`);
  console.log(`Local theme ids: ${localIds.join(', ')}`);

  if (localIds.length !== localNames.length) {
    console.warn(
      `Warning: ${localIds.length} palettes in generate-theme.mjs but ` +
        `${localNames.length} names in ThemeToggle.res — the catalogues may be out of sync.`
    );
  }

  let failed = false;
  for (const localName of localNames) {
    const canonicalName = localToCanonicalName[localName] ?? localName;
    if (canonicalNames.has(canonicalName)) {
      const mapped = canonicalName === localName ? '' : ` (mapped to "${canonicalName}")`;
      console.log(`  ok: "${localName}"${mapped}`);
    } else {
      console.error(
        `  MISMATCH: local theme "${localName}" (expected canonical name "${canonicalName}") ` +
          `is not in the canonical catalogue [${[...canonicalNames].join(', ')}]`
      );
      failed = true;
    }
  }

  if (failed) {
    console.error('Theme contract check failed.');
    process.exit(1);
  }
  console.log('Theme contract check passed.');
}

check();
