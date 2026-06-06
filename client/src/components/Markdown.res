// Renders the chat bot's markdown replies as React *elements* (never raw HTML),
// so model output can't inject markup. Parsing lives in markdownParse.mjs; this
// module only builds elements and validates link schemes. Styling uses theme
// tokens so it blends into the chat bubble.

type block
type inlineTok

@module("./markdownParse.mjs") external parse: string => array<block> = "parse"

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
    | "bold" => <strong key className="font-semibold"> {React.string(tVal(tok))} </strong>
    | "italic" => <em key className="italic"> {React.string(tVal(tok))} </em>
    | "code" =>
      <code key className="rounded bg-foreground/10 px-1 py-0.5 font-mono text-[0.85em]">
        {React.string(tVal(tok))}
      </code>
    | "link" =>
      tHref(tok)->safeHref
        ? <a
            key
            href={tHref(tok)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:no-underline">
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

@react.component
let make = (~text) =>
  <div className="space-y-2">
    {parse(text)
    ->Array.mapWithIndex((b, i) => {
      let key = Int.toString(i)
      switch bType(b) {
      | "ul" => <ul key className="list-disc space-y-1 pl-5"> {renderItems(bItems(b))} </ul>
      | "ol" => <ol key className="list-decimal space-y-1 pl-5"> {renderItems(bItems(b))} </ol>
      | "code" =>
        <pre
          key
          className="overflow-x-auto rounded-lg bg-foreground/10 p-3 font-mono text-xs leading-relaxed">
          <code> {React.string(bText(b))} </code>
        </pre>
      | _ => <p key> {renderInline(bInline(b))} </p>
      }
    })
    ->React.array}
  </div>
