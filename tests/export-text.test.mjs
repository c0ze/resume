import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import PDFDocument from 'pdfkit';

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

test('missingGlyphs names the characters a font cannot draw, ignoring control characters', () => {
  const font = { hasGlyphForCodePoint: (cp) => cp < 0x2000 && cp !== 0x0a && cp !== 0x09 };
  assert.deepEqual(missingGlyphs(font, 'PCM\u2192MP3 \u2192 x\n\t'), ['\u2192']);
  assert.deepEqual(missingGlyphs(font, 'plain text'), []);
  // A space the font lacks is a box like any other character.
  assert.deepEqual(missingGlyphs(font, 'x\u3000y'), ['\u3000']);
});

// Some characters have no glyph of their own yet draw nothing: fontkit folds a
// variation selector into the character before (an IVS picks a kanji variant),
// and the Noto Serif/Sans fonts map ZWJ, ZWNJ, U+00AD, U+2060 and U+FEFF to an
// invisible glyph. Other default-ignorable code points still draw a .notdef box
// (U+180F in Noto Serif), and so do ZWJ and friends in the CJK fonts, so the
// guard asks the font's own layout, through PDFKit as the generator does.
const fontDir = path.join(projectRoot, 'public/fonts');
const fontkitFont = (() => {
  const doc = new PDFDocument({ autoFirstPage: false });
  const cache = new Map();
  return (file) => {
    if (!cache.has(file)) {
      doc.registerFont(file, path.join(fontDir, file));
      doc.font(file);
      cache.set(file, doc._font.font);
    }
    return cache.get(file);
  };
})();

test('missingGlyphs passes variation selectors and invisible format characters the font hides', () => {
  const serif = fontkitFont('NotoSerif-Regular.ttf');
  const text = 'a\u2122\uFE0F a\uFE00b \u{E0100}x a\u200Db a\u200Cb co\u00ADop word\u2060joiner \uFEFFx';
  assert.deepEqual(missingGlyphs(serif, text), []);
  assert.deepEqual(missingGlyphs(fontkitFont('NotoSerifCJKJP-Regular.ttf'), '\u845B\u{E0100} \u845B\uFE00 co\u00ADop'), []);
});

test('missingGlyphs fails default-ignorables that still draw .notdef', () => {
  const serif = fontkitFont('NotoSerif-Regular.ttf');
  for (const cp of [0x115f, 0x1160, 0x180f, 0x3164, 0xffa0]) {
    const char = String.fromCodePoint(cp);
    assert.deepEqual(missingGlyphs(serif, `a${char}b`), [char], `U+${cp.toString(16).toUpperCase()}`);
  }
  // The CJK fonts have no invisible glyph for these: they would draw tofu.
  const cjk = fontkitFont('NotoSerifCJKJP-Regular.ttf');
  assert.deepEqual(missingGlyphs(cjk, 'a\u200Db a\u200Cb x\u2060y \uFEFFz'), ['\u200D', '\u200C', '\u2060', '\uFEFF']);
});

test('missingGlyphs still checks drawable characters and combining marks', () => {
  const font = { hasGlyphForCodePoint: (cp) => cp < 0x300 };
  assert.deepEqual(missingGlyphs(font, 'e\u0301 \u2122 x'), ['\u0301', '\u2122']);
});

// Japanese punctuation is a separator too, and brackets nest: stripping must
// not glue the remaining words together or leave an empty "()" behind.
test('stripCJK keeps words apart across Japanese separators and empties nested brackets', () => {
  assert.equal(stripCJK('x (\u65E5\u672C (\u6771\u4EAC)) y'), 'x y');
  assert.equal(stripCJK('x\uFF08Japan\u3001\u65E5\u672C\u3001Korea\uFF09y'), 'x (Japan, Korea) y');
  assert.equal(stripCJK('Japan\uFF0C\u65E5\u672C\uFF1BKorea'), 'Japan, Korea');
});

// Separators and brackets left behind by the strip are cleaned until nothing
// empty is left, and a bracket group removed between two words leaves a space.
test('stripCJK leaves no empty list slot, no empty bracket and no glued words', () => {
  assert.equal(stripCJK('\u65E5\u672C\u3001\u6771\u4EAC'), '');
  assert.equal(stripCJK('Japan\u3001\u65E5\u3001\u65E5\u3001Korea'), 'Japan, Korea');
  assert.equal(stripCJK('x ((\u65E5\u672C), (\u6771\u4EAC)) y'), 'x y');
  assert.equal(stripCJK('x(\u65E5\u672C)y'), 'x y');
});

test('stripCJK handles deeply nested brackets in linear time', () => {
  const depth = 16000;
  const nested = 'x ' + '('.repeat(depth) + '\u65E5' + ')'.repeat(depth) + ' y';
  const start = performance.now();
  assert.equal(stripCJK(nested), 'x y');
  assert.ok(performance.now() - start < 250, 'expected one pass, not one per nesting level');
});
