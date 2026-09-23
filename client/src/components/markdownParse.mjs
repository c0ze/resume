// Minimal Markdown parser for chat replies. Returns a plain-data block tree;
// the ReScript renderer (Markdown.res) turns it into React *elements* — never
// raw HTML — so model output cannot inject markup. Authored as plain JS (not
// inside a ReScript %raw template) to keep the regex escapes intact.
//
// Supported subset (what the ai.arda.tr bot actually emits):
//   **bold**, *italic* / _italic_, `code`, [text](url),
//   "-" / "*" / "+" bullet lists, "1." ordered lists, ``` fenced code, paragraphs.

const UL = /^\s*[-*+]\s+(.*)$/;
const OL = /^\s*\d+\.\s+(.*)$/;
const FENCE = /^\s*```/;
const HEADING = /^\s*#{1,6}\s+/;
const INLINE =
  /(\*\*([\s\S]+?)\*\*)|(`([^`]+?)`)|(\[([^\]]+?)\]\(([^)\s]+)\))|(\*([^*\n]+?)\*)|(_([^_\n]+?)_)/;

function tokenizeInline(input) {
  const s = String(input == null ? "" : input);
  const tokens = [];
  let rest = s;
  let guard = 0;
  while (rest.length > 0) {
    // Safety bound: preserve the remainder as text rather than dropping it.
    if (guard++ >= 5000) {
      tokens.push({ t: "text", v: rest });
      break;
    }
    const m = INLINE.exec(rest);
    if (!m) {
      tokens.push({ t: "text", v: rest });
      break;
    }
    if (m.index > 0) tokens.push({ t: "text", v: rest.slice(0, m.index) });
    if (m[1] != null) tokens.push({ t: "bold", v: m[2] });
    else if (m[3] != null) tokens.push({ t: "code", v: m[4] });
    else if (m[5] != null) tokens.push({ t: "link", v: m[6], href: m[7] });
    else if (m[8] != null) tokens.push({ t: "italic", v: m[9] });
    else if (m[10] != null) tokens.push({ t: "italic", v: m[11] });
    rest = rest.slice(m.index + m[0].length);
  }
  if (tokens.length === 0) tokens.push({ t: "text", v: "" });
  return tokens;
}

export function parse(src) {
  const text = String(src == null ? "" : src);
  const lines = text.split("\n");
  const blocks = [];
  let i = 0;
  const blank = (l) => l.trim() === "";

  while (i < lines.length) {
    const line = lines[i];
    if (blank(line)) {
      i++;
      continue;
    }
    // Fenced code block.
    if (FENCE.test(line)) {
      i++;
      const code = [];
      while (i < lines.length && !FENCE.test(lines[i])) {
        code.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // consume the closing fence
      blocks.push({ type: "code", text: code.join("\n") });
      continue;
    }
    // Unordered list.
    if (UL.test(line)) {
      const items = [];
      while (i < lines.length && UL.test(lines[i])) {
        items.push(tokenizeInline(lines[i].replace(UL, "$1")));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    // Ordered list.
    if (OL.test(line)) {
      const items = [];
      while (i < lines.length && OL.test(lines[i])) {
        items.push(tokenizeInline(lines[i].replace(OL, "$1")));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }
    // Paragraph: gather consecutive plain lines.
    const para = [];
    while (
      i < lines.length &&
      !blank(lines[i]) &&
      !UL.test(lines[i]) &&
      !OL.test(lines[i]) &&
      !FENCE.test(lines[i])
    ) {
      para.push(lines[i].replace(HEADING, ""));
      i++;
    }
    blocks.push({ type: "p", inline: tokenizeInline(para.join(" ")) });
  }
  return blocks;
}

// The part of a reply the voice has reached (`n` UTF-16 units of the raw text;
// Infinity = all), safe to render as markdown: never half a surrogate pair, a
// half-typed link shows as its label, and an open ** or ` is closed so the
// word being spoken is not framed by markers. Based on ai.arda.tr's
// reveal_prefix, plus: an opener with nothing after it yet (the voice pauses
// right before a bold word) is dropped, not closed — "**" + "**" is not bold
// here, so closing it would flash a literal "****".
export function revealPrefix(text, n) {
  const s0 = String(text == null ? "" : text);
  if (!(n < s0.length)) return s0;
  let s = s0.slice(0, Math.max(0, n));
  const last = s.charCodeAt(s.length - 1);
  if (last >= 0xd800 && last <= 0xdbff) s = s.slice(0, -1);
  if (s.endsWith("*") && s0.charAt(s.length) === "*") s = s.slice(0, -1); // half a ** marker
  s = s.replace(/\[([^\]\n]*)(\]\([^)\n]*)?$/, "$1");
  if ((s.match(/\*\*/g) || []).length % 2) s = s.endsWith("**") ? s.slice(0, -2) : s + "**";
  if ((s.match(/`/g) || []).length % 2) s = s.endsWith("`") ? s.slice(0, -1) : s + "`";
  return s;
}
