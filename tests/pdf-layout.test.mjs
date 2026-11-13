// The PDF generator's layout decisions, tested without drawing a PDF:
// how far a long subtitle may shrink, and where a block of text may break
// across pages (scripts/pdf-layout.mjs).

import test from 'node:test';
import assert from 'node:assert/strict';

import { fitFontSize, linesThatFit, planBlock, planList } from '../scripts/pdf-layout.mjs';

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

// ── Where a block breaks ──────────────────────────────────────────────
// planBlock(lines, fit, capacity, top) → the block's line counts per page;
// a leading 0 means it starts on the next page. `fit` is how many lines fit
// below the cursor, `capacity` how many fit on a fresh page, `top` whether
// the cursor is already at the top of a fresh page. 51 is a fresh page of
// English 9.5pt body lines.

test('linesThatFit counts a line in once its top plus one line height is above the margin', () => {
  // PDFKit places a line while y + lineHeight <= maxY, stepping lineHeight + lineGap.
  assert.equal(linesThatFit(9, 10, 12), 0);
  assert.equal(linesThatFit(10, 10, 12), 1);
  assert.equal(linesThatFit(21.9, 10, 12), 1);
  assert.equal(linesThatFit(22, 10, 12), 2);
});

test('a block that fits stays whole where it is', () => {
  assert.deepEqual(planBlock(3, 3, 51), [3]);
  assert.deepEqual(planBlock(5, 40, 51), [5]);
});

test('a short block (up to four lines) moves to the next page whole', () => {
  assert.deepEqual(planBlock(3, 2, 51), [0, 3]);
  assert.deepEqual(planBlock(4, 3, 51), [0, 4]);
  assert.deepEqual(planBlock(1, 0, 51), [0, 1]);
});

test('a long block with room for all but one line breaks one line early, not after it', () => {
  // Five lines, four available: 4 + 1 would strand a line; the whole block
  // moving would strand the heading above it. 3 + 2 keeps both.
  assert.deepEqual(planBlock(5, 4, 51), [3, 2]);
  assert.deepEqual(planBlock(6, 2, 51), [2, 4]);
});

test('a long block with room for one line starts on the next page', () => {
  assert.deepEqual(planBlock(6, 1, 51), [0, 6]);
});

test('a page that is already fresh is never skipped', () => {
  assert.deepEqual(planBlock(3, 2, 2, true), [2, 1]);
  assert.deepEqual(planBlock(60, 51, 51, true), [51, 9]);
});

test('a block taller than a page breaks into full pages and never ends on one line', () => {
  // Page capacity plus one: at the top of a fresh page, 51 + 1 would strand
  // the last line, and moving to another fresh page would add a page for
  // nothing.
  assert.deepEqual(planBlock(52, 51, 51, true), [50, 2]);
  assert.deepEqual(planBlock(52, 51, 51, false), [50, 2]);
  assert.deepEqual(planBlock(62, 10, 51), [10, 50, 2]);
  assert.deepEqual(planBlock(103, 51, 51, true), [51, 50, 2]);
  assert.deepEqual(planBlock(120, 51, 51, true), [51, 51, 18]);
  // Mid-page, a page-plus block takes the room it has rather than skipping it.
  assert.deepEqual(planBlock(60, 20, 51), [20, 40]);
});

test('every planned segment holds the whole block, and none after the first is a lone line', () => {
  for (let lines = 1; lines <= 160; lines++) {
    for (const fit of [0, 1, 2, 3, 4, 5, 10, 50, 51]) {
      for (const top of [false, true]) {
        const plan = planBlock(lines, top ? 51 : fit, 51, top);
        assert.equal(plan.reduce((a, b) => a + b, 0), lines, `${lines}/${fit}/${top}`);
        assert.ok(plan.every((n, i) => n <= (i === 0 ? (top ? 51 : fit) : 51)), `${lines}/${fit}/${top}: ${plan}`);
        if (plan.length - (plan[0] === 0 ? 1 : 0) > 1) {
          assert.ok(plan.at(-1) >= 2, `${lines}/${fit}/${top}: ${plan}`);
          assert.ok(plan.find((n) => n > 0) >= 2, `${lines}/${fit}/${top}: ${plan}`);
        }
      }
    }
  }
});

// planList(items, fit, capacity, top): one plan per item of a bulleted list.
test('the items of a list follow each other on the page', () => {
  assert.deepEqual(planList([2, 2, 2], 10, 51), [[2], [2], [2]]);
  assert.deepEqual(planList([2, 3, 2], 6, 51), [[2], [0, 3], [2]]);
});

test('the last item of a list does not start a page on its own', () => {
  // [2] [2] fit, the last two-line item does not: the one before it goes
  // with it.
  assert.deepEqual(planList([2, 2, 2], 5, 51), [[2], [0, 2], [2]]);
  // A single-item list has nothing to keep it company.
  assert.deepEqual(planList([3], 2, 51), [[0, 3]]);
  // At the top of a fresh page the item before cannot move any further.
  assert.deepEqual(planList([2, 3], 3, 51, true), [[2], [0, 3]]);
  // When the last item breaks across the page it does not start one alone.
  assert.deepEqual(planList([2, 6], 5, 51), [[2], [3, 3]]);
});

test('a two-item list moves whole when its last item would start a page alone', () => {
  // The heading check reads the first item's plan: a leading 0 there moves
  // the heading too.
  assert.deepEqual(planList([2, 3], 4, 51), [[0, 2], [3]]);
});

test('the item before the last moves with it only when the two fit on a fresh page together', () => {
  // 48 + 4 lines do not fit 51: moving the 48-line item would leave this
  // page short and the last item alone at the top of the page after.
  assert.deepEqual(planList([48, 4], 50, 51), [[48], [0, 4]]);
  // 47 + 4 fit together, so they move together.
  assert.deepEqual(planList([47, 4], 49, 51), [[0, 47], [4]]);
});
