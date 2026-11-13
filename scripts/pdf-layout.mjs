// Layout decisions for the PDF generator (scripts/generate-resume.mjs) that
// need no PDF to make, so tests/pdf-layout.test.mjs can check them directly.

/**
 * The largest size, from `from` down to `floor` in quarter points, at which
 * a one-line string fits `maxWidth`. A string still too wide at the floor
 * fails the build rather than wrapping (in Japanese a wrap breaks mid-word).
 *
 * @param {(size: number) => number} widthAt  the string's width at a size
 * @param {number} maxWidth
 * @param {{ from: number, floor: number, label: string }} options
 * @returns {number}
 */
export function fitFontSize(widthAt, maxWidth, { from, floor, label }) {
  let size = from;
  while (widthAt(size) > maxWidth && size > floor) size = Math.max(floor, size - 0.25);
  if (widthAt(size) > maxWidth) {
    throw new Error(
      `[${label}] the subtitle is ${widthAt(size).toFixed(1)}pt wide at the ${floor}pt floor; ` +
        `the content width is ${maxWidth.toFixed(1)}pt. Shorten it in the content.`,
    );
  }
  return size;
}

// ── Where a block of text breaks across pages ──────────────────────────
// Counted in lines of one font and size. PDFKit places a line while its top
// plus one line height is above the bottom margin, and steps a line height
// plus lineGap per line, so a block of n lines uses n slots and `fit` drops
// by exactly n after it.

/** Blocks of up to this many lines are never broken across pages. */
export const KEEP_LINES = 4;

/**
 * How many lines of height `lineHeight`, `step` apart, fit in `room` points.
 */
export function linesThatFit(room, lineHeight, step) {
  return room < lineHeight ? 0 : Math.floor((room - lineHeight) / step + 1e-9) + 1;
}

/**
 * The line counts a block puts on each page, the first on the current one;
 * a leading 0 means the block starts on the next page.
 *
 *   - It fits: it stays whole.
 *   - Up to KEEP_LINES lines: it moves to the next page whole.
 *   - Longer: it breaks, with at least two lines before the first break (or
 *     it starts on the next page) and at least two after the last one; a
 *     block taller than a page fills whole pages in between.
 *   - A page that is already fresh (`top`) is never skipped.
 *
 * @param {number} lines     the block's line count
 * @param {number} fit       lines that fit below the cursor
 * @param {number} capacity  lines that fit on a fresh page
 * @param {boolean} [top]    the cursor is at the top of a fresh page
 * @returns {number[]}
 */
export function planBlock(lines, fit, capacity, top = false) {
  if (lines <= fit) return [lines];
  const moveWhole = () => [0, ...planBlock(lines, capacity, capacity, true)];
  if (!top && (lines <= KEEP_LINES || fit < 2)) return moveWhole();

  const segments = [];
  let rest = lines;
  let room = fit;
  while (rest > room) {
    segments.push(room);
    rest -= room;
    room = capacity;
  }
  segments.push(rest);

  // A lone last line takes one from the segment before it.
  const n = segments.length;
  if (segments[n - 1] === 1) {
    if (segments[n - 2] >= 3) {
      segments[n - 2]--;
      segments[n - 1]++;
    } else if (!top) {
      return moveWhole();
    }
  }
  return segments;
}

// Lines that fit after a block placed with `plan`, and whether that is the
// top of a fresh page (it never is: something was just placed).
function after(plan, fit, capacity) {
  return plan.length === 1 ? fit - plan[0] : capacity - plan[plan.length - 1];
}

/**
 * planBlock for each item of a bulleted list, in order, plus one list rule:
 * the last item does not start a page on its own. When it would, the item
 * before it moves to the next page with it, if that item sat whole on this
 * page and this page is not already fresh at it.
 *
 * @param {number[]} items   line count of each item
 * @param {number} fit
 * @param {number} capacity
 * @param {boolean} [top]
 * @returns {number[][]}
 */
export function planList(items, fit, capacity, top = false) {
  const plans = [];
  const states = [];
  let room = fit;
  let fresh = top;
  for (const lines of items) {
    states.push({ room, fresh });
    const plan = planBlock(lines, room, capacity, fresh);
    plans.push(plan);
    room = after(plan, room, capacity);
    fresh = false;
  }

  const n = items.length;
  if (n >= 2 && plans[n - 1][0] === 0 && plans[n - 2].length === 1 && !states[n - 2].fresh && items[n - 2] <= capacity) {
    plans[n - 2] = [0, items[n - 2]];
    plans[n - 1] = planBlock(items[n - 1], capacity - items[n - 2], capacity, false);
  }
  return plans;
}
