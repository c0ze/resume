import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { stripCJK, sanitizeContent, withGlyphFallbacks, missingGlyphs } from '../scripts/export-text.mjs';

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

// Noto Serif and Noto Sans, the en/tr PDF fonts, have no arrows.
test('withGlyphFallbacks spells out characters the en/tr PDF fonts lack', () => {
  assert.equal(withGlyphFallbacks('LAME (PCM\u2192MP3)'), 'LAME (PCM->MP3)');
  assert.deepEqual(withGlyphFallbacks({ a: ['x \u2192 y'], n: 1 }), { a: ['x -> y'], n: 1 });
});

test('missingGlyphs names the characters a font cannot draw, ignoring whitespace', () => {
  const font = { hasGlyphForCodePoint: (cp) => cp < 0x2000 && cp !== 0x20 && cp !== 0x0a };
  assert.deepEqual(missingGlyphs(font, 'PCM\u2192MP3 \u2192 x\n'), ['\u2192']);
  assert.deepEqual(missingGlyphs(font, 'plain text'), []);
});

// Variation selectors and other default-ignorable format characters never need
// a glyph of their own: the layout engine folds them into the character before
// (an IVS picks a glyph variant) or drops them. Requiring one would fail the
// build on valid text such as "\u2122\uFE0F" or an IVS-marked kanji.
test('missingGlyphs does not ask for glyphs for variation selectors and invisible format characters', () => {
  const exempt = [0xfe0f, 0xfe00, 0xe0100, 0xe01ef, 0x200d, 0x200c, 0x00ad, 0x2060, 0xfeff];
  const font = { hasGlyphForCodePoint: (cp) => !exempt.includes(cp) };
  const text = 'a\u2122\uFE0F \u845B\u{E0100} a\u200Db a\u200Cb co\u00ADop word\u2060joiner \uFEFFx \uFE00\u{E01EF}';
  assert.deepEqual(missingGlyphs(font, text), []);
});

test('missingGlyphs still checks drawable characters and combining marks', () => {
  const font = { hasGlyphForCodePoint: (cp) => cp < 0x300 };
  assert.deepEqual(missingGlyphs(font, 'e\u0301 \u2122\uFE0F'), ['\u0301', '\u2122']);
});
