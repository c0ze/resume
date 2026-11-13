// The PDF generator's layout decisions, tested without drawing a PDF:
// how far a long subtitle may shrink, and where a block of text may break
// across pages (scripts/pdf-layout.mjs).

import test from 'node:test';
import assert from 'node:assert/strict';

import { fitFontSize } from '../scripts/pdf-layout.mjs';

// A string 40pt wide per point of font size: 11pt is 440pt.
const width = (perPoint) => (size) => size * perPoint;

test('a subtitle that fits keeps its size', () => {
  assert.equal(fitFontSize(width(40), 451.3, { from: 11, floor: 9.5, label: 'en' }), 11);
});

test('a subtitle too wide steps down a quarter point until it fits', () => {
  // 475.5pt at 11pt (the japan-bridge flavour in Japanese) fits at 10.25pt.
  assert.equal(fitFontSize(width(475.5 / 11), 451.3, { from: 11, floor: 9.5, label: 'ja' }), 10.25);
});

test('a subtitle still too wide at the floor fails the build, saying where and by how much', () => {
  assert.throws(
    () => fitFontSize(width(50), 451.3, { from: 11, floor: 9.5, label: 'japan-bridge/ja' }),
    (error) => /japan-bridge\/ja/.test(error.message) && /475\.0pt/.test(error.message) && /451\.3pt/.test(error.message) && /9\.5pt/.test(error.message),
  );
});
