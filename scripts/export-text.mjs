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
// A string without Japanese is returned unchanged.
export function stripCJK(text) {
  if (typeof text !== 'string' || !HAS_CJK.test(text)) return text;
  return text
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(CJK_RUN, '')
    .replace(/\(\s*[,;]\s*/g, '(') //      "(, Japonya" → "(Japonya"
    .replace(/\s*[,;]\s*\)/g, ')') //      "Korea, )"   → "Korea)"
    .replace(/([,;])\s*[,;]/g, '$1') //    "Japan; ; Korea" → "Japan; Korea"
    .replace(/\s*\(\s*\)/g, '') //         "Griffon ()" → "Griffon"
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
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
// Whitespace and control characters are laid out, not drawn, so they are
// skipped.
export function missingGlyphs(font, text) {
  const missing = new Set();
  for (const char of String(text)) {
    if (/[\s\p{Cc}]/u.test(char)) continue;
    if (!font.hasGlyphForCodePoint(char.codePointAt(0))) missing.add(char);
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
