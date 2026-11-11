// Text clean-up shared by the en/tr PDF and DOCX generators.
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

// Apply stripCJK to every string in a loaded content object.
export function sanitizeContent(obj) {
  if (typeof obj === 'string') return stripCJK(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeContent);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = sanitizeContent(v);
    return out;
  }
  return obj;
}
