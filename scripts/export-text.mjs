// Text helpers shared by the PDF and DOCX generators.
//
// The en/tr exports are set in fonts without Japanese glyphs, so Japanese
// that appears inside English or Turkish text (a game's original title, say)
// is dropped from them. The ja exports use CJK fonts and skip this step.

const CJK = '\u3000-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF';
const HAS_CJK = new RegExp(`[${CJK}]`, 'u');
const CJK_RUN = new RegExp(`[${CJK}]+`, 'gu');

// Strip the Japanese runs from a string and tidy what they leave behind,
// keeping everything else in a bracket:
//   "Griffon'un (幻塔戦記グリフォン, Japonya + Kore)" → "Griffon'un (Japonya + Kore)"
//   "'Griffon' (幻塔戦記グリフォン), a mobile MMORPG" → "'Griffon', a mobile MMORPG"
//   "x ((日本), (東京)) y" → "x y"
// A string without Japanese is returned unchanged.
export function stripCJK(text) {
  if (typeof text !== 'string' || !HAS_CJK.test(text)) return text;
  // Japanese delimiters become their ASCII forms first (they fall in the CJK
  // range and would otherwise vanish with the run, gluing words together).
  // A fullwidth bracket carries its own spacing, so it gets a space where it
  // touches a word.
  const stripped = text
    .replace(/（/g, (_, i, s) => (i > 0 && !/\s/.test(s[i - 1]) ? ' (' : '('))
    .replace(/）/g, (_, i, s) => (/[\p{L}\p{N}]/u.test(s[i + 1] ?? '') ? ') ' : ')'))
    .replace(/[、，]/g, ', ')
    .replace(/；/g, '; ')
    .replace(CJK_RUN, '');

  // One pass over the brackets with a stack: each group is tidied when it
  // closes, and a group left empty is dropped (marked, so the level above can
  // decide whether a space must stand in for it).
  const levels = [''];
  for (const char of stripped) {
    if (char === '(') {
      levels.push('');
    } else if (char === ')' && levels.length > 1) {
      const inner = tidyLevel(levels.pop()).trim();
      levels[levels.length - 1] += inner ? `(${inner})` : DROPPED;
    } else {
      levels[levels.length - 1] += char;
    }
  }
  while (levels.length > 1) {
    const unclosed = levels.pop(); // an unmatched "(" stays as written
    levels[levels.length - 1] += `(${unclosed}`;
  }
  return tidyLevel(levels[0]).replace(/[ \t]{2,}/g, ' ').trim();
}

const DROPPED = '\u0000';

// Tidy the text of one bracket level (a group, or the whole string): a
// dropped group becomes a space between two words and nothing next to
// punctuation; list slots the strip emptied collapse ("Japan, , Korea" →
// "Japan, Korea"); and a separator left at either end goes ("(, Japonya" →
// "(Japonya", "日本、東京" → "").
function tidyLevel(level) {
  return level
    .replace(/\s*\u0000[\s\u0000]*/g, (gap, i, s) => {
      const before = s[i - 1] ?? '';
      const after = s[i + gap.length] ?? '';
      return before && after && !/[\s(]/.test(before) && !/[\s,;.:!?)]/.test(after) ? ' ' : '';
    })
    .replace(/([,;])(?:\s*[,;])+/g, '$1')
    .replace(/^\s*[,;]\s*/, '')
    .replace(/\s*[,;]\s*$/, '');
}

// Apply `fn` to every string in a loaded content object.
function mapStrings(obj, fn) {
  if (typeof obj === 'string') return fn(obj);
  if (Array.isArray(obj)) return obj.map((v) => mapStrings(v, fn));
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = mapStrings(v, fn);
    return out;
  }
  return obj;
}

// Apply stripCJK to every string in a loaded content object.
export function sanitizeContent(obj) {
  return mapStrings(obj, stripCJK);
}

// Characters the en/tr PDF fonts (Noto Serif, Noto Sans) have no glyph for,
// and what to print instead. The content keeps the real character: the web
// page and the DOCX (whose fonts are the reader's) show it as written.
const GLYPH_FALLBACKS = [['\u2192', '->']];

export function withGlyphFallbacks(obj) {
  return mapStrings(obj, (text) =>
    GLYPH_FALLBACKS.reduce((out, [from, to]) => out.replaceAll(from, to), text)
  );
}

// The characters of `text` that `font` (a fontkit font) has no glyph for.
// Control characters (line breaks, tabs) are laid out, not drawn, and
// skipped. Spaces are not: a font without U+3000 or U+00A0 draws a box too,
// and JavaScript's \s would also let U+FEFF through.
//
// A few characters may have no glyph of their own and still draw nothing:
// fontkit folds variation selectors (U+FE00-FE0F, U+E0100-E01EF) into the
// character before, and Noto Serif/Sans map the soft hyphen, ZWNJ, ZWJ, the
// word joiner and the BOM to an invisible glyph. Each of those passes only when
// the font's own layout confirms it draws no .notdef: the CJK fonts, for one,
// draw ZWJ as a box. Every other character, default-ignorable or not, needs a
// glyph.
const LAYOUT_MAY_HIDE = /[\uFE00-\uFE0F\u{E0100}-\u{E01EF}\u00AD\u200C\u200D\u2060\uFEFF]/u;

const drawsNotdef = (font, char) =>
  typeof font.layout !== 'function' || font.layout(`a${char}a`).glyphs.some((glyph) => glyph.id === 0);

export function missingGlyphs(font, text) {
  const missing = new Set();
  for (const char of String(text)) {
    if (/\p{Cc}/u.test(char)) continue;
    if (font.hasGlyphForCodePoint(char.codePointAt(0))) continue;
    if (LAYOUT_MAY_HIDE.test(char) && !drawsNotdef(font, char)) continue;
    missing.add(char);
  }
  return [...missing];
}

// The date of issue printed after pdf_meta.generatedOn: the ISO date
// (YYYY-MM-DD, UTC) of the build, the same date the web page prints as
// "Issued". scripts/build-static.mjs pins RESUME_BUILD_TIME once per build;
// a generator run on its own falls back to now.
export function issueDate() {
  return (process.env.RESUME_BUILD_TIME ?? new Date().toISOString()).slice(0, 10);
}
