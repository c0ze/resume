// A section of the document, as a native disclosure.
//
// `<details>` rather than a JS toggle, for three reasons that all matter to this
// product: the content stays in the prerendered HTML whether the section is open
// or shut, it works with JavaScript off, and browser find-in-page expands a
// closed section to reveal a match. An ATS parsing the markup sees the whole
// record; so does a crawler. The print sheet forces every section open, because
// on paper there is no interaction to defer to.
//
// The name, the hint and the arrival state are read from Outline.res by id
// rather than passed in, so this and the nav cannot disagree about what the
// document contains.
//
// Everything but the statement arrives collapsed, which makes the closing hint
// on each row load-bearing: it is the only evidence a reader has of what a shut
// section holds.

@react.component
let make = (~id, ~children) => {
  let {translations: t} = LanguageContext.useLanguage()

  switch Outline.find(t, id) {
  | None => React.null
  | Some(entry) =>
    <section id className="section">
      <details className="sect" open_=entry.openByDefault>
        <summary className="sect__summary">
          // A heading, not a styled span: the summary carries the section's name and
          // the document must not jump h1 → h3. `summary` allows heading content
          // intermixed with phrasing, so the hint and chevron sit beside it.
          <h2 className="t-h2 sect__name"> {React.string(entry.label)} </h2>
          {entry.hint === ""
            ? React.null
            : <span className="sect__hint"> {React.string(entry.hint)} </span>}
          <svg
            className="sect__chev"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="square"
            ariaHidden=true>
            <path d="M4.5 2.5 L8 6 L4.5 9.5" />
          </svg>
        </summary>
        <div className="sect__body"> {children} </div>
      </details>
    </section>
  }
}
