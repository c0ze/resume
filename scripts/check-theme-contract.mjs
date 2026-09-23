// Theme-contract check (contract v3) — verifies this site's renditions against
// the catalogue arda.tr publishes as config/themes.json.
//
// One Bit Forest (see DESIGN.md and ../DESIGN-SYSTEM.md): every site in the
// family ships the same four rendition ids — xerox, xerox-hc, night, night-hc —
// in the same roles (light, hc-light, dark, hc-dark). Values differ per site by
// design (the résumé's signal is moss), so values are NEVER compared. What is
// checked:
//
//   1. the id set: the local ids equal the contract's ids;
//   2. roles: each id has the same role locally as in the contract
//      (contract field `role`, or `kind` as v2 called it);
//   3. required tokens: every local rendition defines every required token.
//      The contract may list them (`requiredTokens`, at the top level or per
//      theme); otherwise the family core is required: bg, surface, fg, fg-2,
//      rule, signal, ob-ink, ob-ground, ob-signal.
//   4. names are compared too, but a name mismatch only warns — the words are
//      display copy, the ids and roles are the contract.
//
// Soft passes (exit 0 with a warning), so the check never blocks a deploy for
// reasons outside this repo:
//   - the contract cannot be fetched;
//   - the contract is older than v3 (arda.tr main still publishing v2 during
//     the One Bit Forest roll-out describes a catalogue nobody ships any more).
//
// Local sources:
//   - ids, roles and tokens: `themePalettes` in scripts/generate-theme.mjs
//     (imported by evaluating the object literal, not by running the generator);
//   - names: the `{id: …, name: "…"}` list in client/src/components/ThemeToggle.res.
//
// THEMES_CONTRACT_PATH=/path/to/arda.tr/config/themes.json checks against a
// local checkout instead of GitHub (a bad local path is a hard error).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const contractUrl = 'https://raw.githubusercontent.com/c0ze/arda.tr/main/config/themes.json';

const CORE_TOKENS = ['bg', 'surface', 'fg', 'fg-2', 'rule', 'signal', 'ob-ink', 'ob-ground', 'ob-signal'];

// Tokens the generator derives rather than lists in each palette.
const DERIVED_TOKENS = ['ob-ink', 'ob-ground', 'ob-signal', 'radius'];

const normToken = (t) => String(t).trim().replace(/^--/, '');

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
      console.warn(`Warning: contract fetch failed (HTTP ${response.status}) — skipping check (soft pass).`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.warn(`Warning: contract fetch failed (${error.message}) — skipping check (soft pass).`);
    return null;
  }
}

// The `themePalettes` object literal from generate-theme.mjs, evaluated in
// isolation. It is plain data (strings, no references), so this is safe and
// keeps the generator's side effects (writing theme.css) out of the check.
function readLocalPalettes() {
  const source = fs.readFileSync(path.join(projectRoot, 'scripts', 'generate-theme.mjs'), 'utf8');
  const block = source.match(/const themePalettes = (\{[\s\S]*?\n\});/);
  if (!block) throw new Error('Could not find themePalettes in scripts/generate-theme.mjs');
  return Function(`"use strict"; return (${block[1]});`)();
}

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

  const version = Number(contract.version ?? 0);
  if (!(version >= 3)) {
    console.warn(
      `Warning: arda.tr publishes theme contract v${version || '?'}; this check needs v3 ` +
        '(One Bit Forest). Skipping until arda.tr ships v3 (soft pass).'
    );
    process.exit(0);
  }

  const palettes = readLocalPalettes();
  const localIds = Object.keys(palettes);
  const localNames = readLocalThemeNames();
  const themes = Array.isArray(contract.themes) ? contract.themes : [];
  const contractIds = themes.map((t) => t.id);

  console.log(`Contract v${version} ids: ${contractIds.join(', ')}`);
  console.log(`Local ids:             ${localIds.join(', ')}`);

  let failed = false;
  const fail = (msg) => {
    console.error(`  MISMATCH: ${msg}`);
    failed = true;
  };

  // 1. id set
  const missing = contractIds.filter((id) => !localIds.includes(id));
  const extra = localIds.filter((id) => !contractIds.includes(id));
  if (missing.length) fail(`ids missing locally: ${missing.join(', ')}`);
  if (extra.length) fail(`ids not in the contract: ${extra.join(', ')}`);

  const topRequired = Array.isArray(contract.requiredTokens) ? contract.requiredTokens.map(normToken) : null;

  for (const theme of themes) {
    const local = palettes[theme.id];
    if (!local) continue;

    // 2. roles
    const role = theme.role ?? theme.kind;
    if (role && local.role !== role) fail(`"${theme.id}" has role "${local.role}" locally, "${role}" in the contract`);
    else console.log(`  ok: "${theme.id}" role ${local.role}`);

    // 3. required tokens (presence only)
    const required = Array.isArray(theme.requiredTokens)
      ? theme.requiredTokens.map(normToken)
      : topRequired ?? CORE_TOKENS;
    const have = new Set([...Object.keys(local).map(normToken), ...DERIVED_TOKENS]);
    const absent = required.filter((t) => !have.has(t));
    if (absent.length) fail(`"${theme.id}" is missing required tokens: ${absent.join(', ')}`);

    // 4. names (warning only)
    const index = localIds.indexOf(theme.id);
    const localName = localNames[index];
    if (theme.name && localName && theme.name !== localName) {
      console.warn(`  warning: "${theme.id}" is named "${localName}" here, "${theme.name}" in the contract`);
    }
  }

  if (localNames.length !== localIds.length) {
    console.warn(
      `  warning: ${localIds.length} palettes in generate-theme.mjs but ${localNames.length} names in ThemeToggle.res`
    );
  }

  if (failed) {
    console.error('Theme contract check failed.');
    process.exit(1);
  }
  console.log('Theme contract check passed.');
}

check();
