// Brand-contract check (contract v4): are this site's copies of the family's
// brand files the ones arda.tr publishes?
//
// Kara Duman (see DESIGN.md and ../DESIGN-SYSTEM.md): arda.tr owns the brand in
// its brand/ folder (the built Astryx theme arda.css + arda.js, the family
// patterns brand.css, the scheme switch scheme.js) and publishes their sha256
// in config/themes.json. The sibling sites carry verbatim copies, here in
// client/src/brand/. A copy that was edited, or that fell behind a change in
// arda.tr, makes the family drift apart without anyone noticing, so:
//
//   - contract v4: the sha256 of every brand file this site carries must
//     equal `files[name].sha256`. A mismatch fails the check.
//   - contract older than v4 (arda.tr main until its rebrand merges): there
//     are no hashes to compare with. A note is printed and the check passes.
//   - contract newer than v4: this script does not know its shape. It fails,
//     so the check gets updated rather than silently passing.
//   - the contract cannot be fetched: a warning and a pass, so an outage
//     outside this repo never fails the run.
//
// THEMES_CONTRACT_PATH=/path/to/arda.tr/config/themes.json checks against a
// local checkout instead of GitHub (a bad local path is a hard error).
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const CONTRACT_VERSION = 4;
export const CONTRACT_URL = 'https://raw.githubusercontent.com/c0ze/arda.tr/main/config/themes.json';
export const BRAND_DIR = path.join(projectRoot, 'client', 'src', 'brand');
// The files the contract hashes. A site carries the ones it uses.
export const BRAND_FILES = ['arda.css', 'arda.js', 'brand.css', 'scheme.js'];

export const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');

/**
 * Compares the local copies with a contract.
 * `read(name)` returns the file's bytes, or null when this site does not carry it.
 * Returns { ok, checked: [names], notes: [strings], mismatches: [strings] }.
 */
export function compareWithContract(contract, read) {
  const result = { ok: true, checked: [], notes: [], mismatches: [] };
  const version = Number(contract?.version ?? 0);

  if (!(version >= CONTRACT_VERSION)) {
    result.notes.push(
      `arda.tr publishes brand contract v${version || '?'}; the hashes arrive with v${CONTRACT_VERSION}. Nothing to compare yet.`
    );
    return result;
  }
  if (version > CONTRACT_VERSION) {
    result.ok = false;
    result.mismatches.push(
      `arda.tr publishes brand contract v${version}; this check reads v${CONTRACT_VERSION}. Update scripts/check-brand-contract.mjs.`
    );
    return result;
  }

  for (const name of BRAND_FILES) {
    const bytes = read(name);
    if (bytes === null) {
      result.notes.push(`${name}: not carried by this site.`);
      continue;
    }
    result.checked.push(name);
    const expected = contract.files?.[name]?.sha256;
    const actual = sha256(bytes);
    if (!expected) {
      result.ok = false;
      result.mismatches.push(`${name}: the contract has no sha256 for it.`);
    } else if (expected !== actual) {
      result.ok = false;
      result.mismatches.push(`${name}: local ${actual}, contract ${expected}. Copy it again from arda.tr's brand/.`);
    }
  }
  if (result.checked.length === 0) {
    result.ok = false;
    result.mismatches.push(`No brand file found in ${path.relative(projectRoot, BRAND_DIR)}.`);
  }
  return result;
}

export function readBrandFile(name) {
  const file = path.join(BRAND_DIR, name);
  return fs.existsSync(file) ? fs.readFileSync(file) : null;
}

async function loadContract() {
  const localPath = process.env.THEMES_CONTRACT_PATH;
  if (localPath) {
    console.log(`Loading brand contract from ${localPath}`);
    return JSON.parse(fs.readFileSync(localPath, 'utf8'));
  }

  console.log(`Fetching brand contract from ${CONTRACT_URL}`);
  try {
    const response = await fetch(CONTRACT_URL);
    if (!response.ok) {
      console.warn(`Warning: contract fetch failed (HTTP ${response.status}); nothing checked (soft pass).`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.warn(`Warning: contract fetch failed (${error.message}); nothing checked (soft pass).`);
    return null;
  }
}

async function check() {
  const contract = await loadContract();
  if (!contract) return;

  const result = compareWithContract(contract, readBrandFile);
  for (const note of result.notes) console.log(`  note: ${note}`);
  for (const name of result.checked) {
    if (!result.mismatches.some((m) => m.startsWith(`${name}:`))) console.log(`  ok: ${name}`);
  }
  for (const mismatch of result.mismatches) console.error(`  MISMATCH: ${mismatch}`);

  if (!result.ok) {
    console.error('Brand contract check failed.');
    process.exit(1);
  }
  console.log(result.checked.length ? 'Brand contract check passed.' : 'Brand contract check passed (nothing to compare).');
}

// Check when run as a script, not when a test imports the module.
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) check();
