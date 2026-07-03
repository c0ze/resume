// Shared flavor-overlay helper for the résumé generators (SP2).
//
// A "flavor" is a role-targeted variant of the résumé. The base résumé
// (ai-platform) has no overlay file — it is the default. Flavors live in
// content/flavors/*.json and override only the summary (header subtitle +
// About paragraphs) per language; the rest of the content is shared, so a
// bullet edited once is inherited by every flavor. See the design doc under
// docs/superpowers/specs.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const flavorsDir = path.resolve(__dirname, '..', 'content', 'flavors');

// Every flavor definition (parsed JSON), or [] when none exist.
export function loadFlavors() {
  if (!fs.existsSync(flavorsDir)) return [];
  return fs
    .readdirSync(flavorsDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => JSON.parse(fs.readFileSync(path.join(flavorsDir, file), 'utf8')));
}

// One { flavor, language } target per flavor × each of its exportLangs —
// the full matrix of flavored artifacts to generate.
export function flavorTargets() {
  return loadFlavors().flatMap((flavor) =>
    (flavor.exportLangs || []).map((language) => ({ flavor, language }))
  );
}

// Overlay a flavor's per-language summary onto a loaded content object `t`.
// Returns a shallow clone; languages the flavor doesn't define are unchanged.
export function applyFlavor(t, flavor, language) {
  const override = flavor && flavor.overrides && flavor.overrides[language];
  if (!override) return t;

  const next = { ...t, header: { ...t.header }, about: { ...t.about } };
  if (override.subtitle) next.header.subtitle = override.subtitle;
  if (override.about) {
    if (override.about.paragraph1 !== undefined) next.about.paragraph1 = override.about.paragraph1;
    if (override.about.paragraph2 !== undefined) next.about.paragraph2 = override.about.paragraph2;
  }
  return next;
}

// Output basename: resume-<flavor>-<lang> for flavors, resume-<lang> for base.
export function artifactBase(flavorName, language) {
  return flavorName ? `resume-${flavorName}-${language}` : `resume-${language}`;
}
