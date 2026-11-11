import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { stripCJK, sanitizeContent } from '../scripts/export-text.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// The en/tr PDF and DOCX use fonts without Japanese glyphs, so the export drops
// the Japanese run. Only the Japanese: a bracket can also carry words the
// reader needs, and those must survive.
test('stripCJK drops only the Japanese run and keeps the rest of the bracket', () => {
  assert.equal(
    stripCJK("Griffon'un (幻塔戦記グリフォン, Japonya + Kore) canlı backend'i"),
    "Griffon'un (Japonya + Kore) canlı backend'i"
  );
  assert.equal(stripCJK('Griffon (Japan + Korea, 幻塔戦記グリフォン)'), 'Griffon (Japan + Korea)');
  assert.equal(stripCJK('Griffon (Japan; 幻塔戦記グリフォン; Korea)'), 'Griffon (Japan; Korea)');
});

test('stripCJK removes a bracket that held nothing but Japanese', () => {
  assert.equal(
    stripCJK("the backend of 'Griffon' (幻塔戦記グリフォン), a mobile MMORPG"),
    "the backend of 'Griffon', a mobile MMORPG"
  );
  assert.equal(stripCJK('Gentosenki Griffin（幻塔戦記グリフォン）'), 'Gentosenki Griffin');
  assert.equal(stripCJK('Tokyo 東京 office'), 'Tokyo office');
});

test('stripCJK leaves text without Japanese untouched', () => {
  for (const text of ['LAME (PCM to MP3)', 'a  b', ' padded ', '(Native), English (Near Native; TOEFL 263, 2004)']) {
    assert.equal(stripCJK(text), text);
  }
  assert.equal(stripCJK(42), 42);
});

test('the Turkish Griffon project keeps "Japonya + Kore" in the export', () => {
  const projects = JSON.parse(fs.readFileSync(path.join(projectRoot, 'content/tr/projects.json'), 'utf8'));
  const exported = sanitizeContent(projects).entries.map((e) => e.description).join('\n');
  assert.match(exported, /Griffon'un \(Japonya \+ Kore\) canlı/);
  assert.doesNotMatch(exported, /\(\s*,/);
});
