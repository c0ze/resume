// Minimal Markdown parser for chat replies. Returns a plain-data block tree;
// the ReScript renderer (Markdown.res) turns it into React *elements* — never
// raw HTML — so model output cannot inject markup. Authored as plain JS (not
// inside a ReScript %raw template) to keep the regex escapes intact.
//
// Supported subset (what the ai.arda.tr bot actually emits):
//   **bold**, *italic* / _italic_, `code`, [text](url),
//   "-" / "*" / "+" bullet lists, "1." ordered lists, ``` fenced code, paragraphs.
//
// Lists: a list runs on across blank lines while the next item is of the same
// kind, and an indented item nests (one level) under the item above it. An
// ordered list that does not start at 1 carries `start`. Items are
// { inline, subs } where `subs` holds the nested list blocks: consecutive
// nested items of one kind form one block, and a change of kind (a bullet,
// then a numbered step) starts another.
//
// Emphasis needs word boundaries: `_` and `*` inside a word (snake_case_name)
// or with a space inside the markers (2 * 3 * 4) are literal. As in
// CommonMark, the word for `*` is ASCII letters and digits only, so
// これは*重要*です is emphasis (Japanese has no spaces between words), while
// `_` keeps the Unicode rule.

const LIST = /^([ \t]*)(?:[-*+]|(\d+)\.)\s+(.*)$/;
const FENCE = /^\s*```/;
const HEADING = /^\s*#{1,6}\s+/;
// Link URLs may hold one level of balanced parentheses: …/Go_(programming_language).
const INLINE =
  /(\*\*([\s\S]+?)\*\*)|(`([^`]+?)`)|(\[([^\]]+?)\]\(((?:[^()\s]|\([^()\s]*\))+)\))|(\*([^*\s](?:[^*\n]*?[^*\s])?)\*)|(_([^_\s](?:[^_\n]*?[^_\s])?)_)/;
const WORD = /[\p{L}\p{N}_]/u; // around `_`
const ASCII_WORD = /[A-Za-z0-9]/; // around `*`

function tokenizeInline(input) {
  const s = String(input == null ? "" : input);
  const tokens = [];
  let rest = s;
  let guard = 0;
  let prev = ""; // the character before `rest`
  // Adjacent text runs merge into one token.
  const pushText = (v) => {
    const last = tokens[tokens.length - 1];
    if (last && last.t === "text") last.v += v;
    else tokens.push({ t: "text", v });
  };
  while (rest.length > 0) {
    // Safety bound: preserve the remainder as text rather than dropping it.
    if (guard++ >= 5000) {
      pushText(rest);
      break;
    }
    const m = INLINE.exec(rest);
    if (!m) {
      pushText(rest);
      break;
    }
    // Single-marker emphasis must not touch a letter or digit on the outside.
    if (m[8] != null || m[10] != null) {
      const before = m.index > 0 ? rest.charAt(m.index - 1) : prev;
      const after = rest.charAt(m.index + m[0].length);
      const word = m[8] != null ? ASCII_WORD : WORD;
      if (word.test(before) || word.test(after)) {
        pushText(rest.slice(0, m.index + 1));
        prev = rest.charAt(m.index);
        rest = rest.slice(m.index + 1);
        continue;
      }
    }
    if (m.index > 0) pushText(rest.slice(0, m.index));
    if (m[1] != null) tokens.push({ t: "bold", v: m[2] });
    else if (m[3] != null) tokens.push({ t: "code", v: m[4] });
    else if (m[5] != null) tokens.push({ t: "link", v: m[6], href: m[7] });
    else if (m[8] != null) tokens.push({ t: "italic", v: m[9] });
    else if (m[10] != null) tokens.push({ t: "italic", v: m[11] });
    prev = m[0].charAt(m[0].length - 1);
    rest = rest.slice(m.index + m[0].length);
  }
  if (tokens.length === 0) tokens.push({ t: "text", v: "" });
  return tokens;
}

// Column of a list item's marker (a tab counts as four).
const indentOf = (m) => m[1].replace(/\t/g, "    ").length;
const isOrdered = (m) => m[2] != null;
const sameKind = (m, block) => isOrdered(m) === (block.type === "ol");
const listItem = (m) => ({ inline: tokenizeInline(m[3]), subs: [] });
function listBlock(m) {
  const block = { type: isOrdered(m) ? "ol" : "ul", items: [listItem(m)] };
  if (isOrdered(m) && Number(m[2]) !== 1) block.start = Number(m[2]);
  return block;
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
    // List (unordered or ordered).
    if (LIST.test(line)) {
      const first = LIST.exec(line);
      const base = indentOf(first);
      const block = listBlock(first);
      i++;
      while (i < lines.length) {
        if (blank(lines[i])) {
          // A blank line ends the list unless an item of it comes next.
          let j = i;
          while (j < lines.length && blank(lines[j])) j++;
          const next = j < lines.length ? LIST.exec(lines[j]) : null;
          if (next && (indentOf(next) > base || sameKind(next, block))) {
            i = j;
            continue;
          }
          break;
        }
        const m = LIST.exec(lines[i]);
        if (!m) break;
        const parent = block.items[block.items.length - 1];
        if (indentOf(m) > base && parent) {
          const sub = parent.subs[parent.subs.length - 1];
          if (sub && sameKind(m, sub)) sub.items.push(listItem(m));
          else parent.subs.push(listBlock(m));
        } else if (sameKind(m, block)) {
          block.items.push(listItem(m));
        } else {
          break; // the other kind of list starts a new block
        }
        i++;
      }
      blocks.push(block);
      continue;
    }
    // Paragraph: gather consecutive plain lines.
    const para = [];
    while (
      i < lines.length &&
      !blank(lines[i]) &&
      !LIST.test(lines[i]) &&
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
