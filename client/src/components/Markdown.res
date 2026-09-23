// Renders the chat bot's markdown replies as React *elements* (never raw HTML),
// so model output can't inject markup. Parsing lives in markdownParse.mjs; this
// module only builds elements and validates link schemes.

type block
type inlineTok

@module("./markdownParse.mjs") external parse: string => array<block> = "parse"
// The part of a spoken reply the voice has reached, safe to parse (see markdownParse.mjs).
@module("./markdownParse.mjs") external revealPrefix: (string, float) => string = "revealPrefix"

let bType: block => string = %raw(`function (b) { return b.type; }`)
let bText: block => string = %raw(`function (b) { return b.text || ""; }`)
let bItems: block => array<array<inlineTok>> = %raw(`function (b) { return b.items || []; }`)
let bInline: block => array<inlineTok> = %raw(`function (b) { return b.inline || []; }`)
let tKind: inlineTok => string = %raw(`function (t) { return t.t; }`)
let tVal: inlineTok => string = %raw(`function (t) { return t.v || ""; }`)
let tHref: inlineTok => string = %raw(`function (t) { return t.href || ""; }`)

// Only allow link schemes that can't execute script (drop javascript:, data:, …).
let safeHref = href =>
  Js.String2.startsWith(href, "https://") ||
  Js.String2.startsWith(href, "http://") ||
  Js.String2.startsWith(href, "mailto:")

let renderInline = toks =>
  toks
  ->Array.mapWithIndex((tok, i) => {
    let key = Int.toString(i)
    switch tKind(tok) {
    | "bold" => <strong key> {React.string(tVal(tok))} </strong>
    | "italic" => <em key> {React.string(tVal(tok))} </em>
    | "code" =>
      <code key className="md-code"> {React.string(tVal(tok))} </code>
    | "link" =>
      tHref(tok)->safeHref
        ? <a key href={tHref(tok)} target="_blank" rel="noopener noreferrer">
            {React.string(tVal(tok))}
          </a>
        : <React.Fragment key> {React.string(tVal(tok))} </React.Fragment>
    | _ => <React.Fragment key> {React.string(tVal(tok))} </React.Fragment>
    }
  })
  ->React.array

let renderItems = items =>
  items
  ->Array.mapWithIndex((line, j) => <li key={Int.toString(j)}> {renderInline(line)} </li>)
  ->React.array

// `after` is appended inside the last block when it is a paragraph (so the
// streaming cursor sits at the end of the line, not under it); otherwise after
// the last block.
@react.component
let make = (~text, ~after=?) => {
  let blocks = parse(text)
  let last = Array.length(blocks) - 1
  let tail = i =>
    switch after {
    | Some(el) if i == last => el
    | _ => React.null
    }
  let trailing = switch (after, blocks->Array.get(last)) {
  | (Some(el), Some(b)) if bType(b) == "ul" || bType(b) == "ol" || bType(b) == "code" => el
  | (Some(el), None) => el
  | _ => React.null
  }
  <div className="md">
    {blocks
    ->Array.mapWithIndex((b, i) => {
      let key = Int.toString(i)
      switch bType(b) {
      | "ul" => <ul key className="md-list"> {renderItems(bItems(b))} </ul>
      | "ol" => <ol key className="md-list md-list--ol"> {renderItems(bItems(b))} </ol>
      | "code" =>
        <pre key className="md-pre"> <code> {React.string(bText(b))} </code> </pre>
      | _ => <p key> {renderInline(bInline(b))} {tail(i)} </p>
      }
    })
    ->React.array}
    {trailing}
  </div>
}
