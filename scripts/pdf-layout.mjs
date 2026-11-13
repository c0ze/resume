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
