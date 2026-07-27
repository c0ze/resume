// Page 01 of the book: the header rule, the name, the struck correction where
// one is active, and the ruled field table. A recruiter who reads only this
// screen knows what Arda is.

let currentYear: int = %raw(`new Date().getFullYear()`)

let normalizeUrl = url => Js.String2.startsWith(url, "http") ? url : "https://" ++ url

@react.component
let make = (~folios: Folio.t) => {
  let {translations: t, base, flavor} = LanguageContext.useLanguage()
  let r = t.record

  // The one real correction this document contains. A ?flavor= deep link
  // replaces the position of record; the original is struck and kept, with a
  // stamp naming the parameter that caused the amendment. Nothing else is ever
  // struck — an invented correction would be a lie about the record.
  let amendment = switch flavor {
  | Some(name) if base.header.subtitle !== t.header.subtitle => Some(name)
  | _ => None
  }

  let residency =
    r.residentSince->String.replaceAll("{years}", Int.toString(currentYear - 2004))
  let summary =
    r.recordSummary
    ->String.replaceAll("{jobs}", Int.toString(Array.length(t.experience.jobs)))
    ->String.replaceAll("{degrees}", Int.toString(Array.length(t.education.entries)))

  <header id="top" className="masthead js-page js-snap">
    <div className="masthead__strip">
      <span className="t-label"> {React.string(r.book)} </span>
      <span className="t-data pencil">
        {React.string(
          `${r.volume} · 00–06 · ${r.pagesLabel} ${Folio.pad(folios.index)}–${Folio.pad(
              folios.total,
            )}`,
        )}
      </span>
    </div>

    <h1 className="t-display"> {React.string(t.header.title)} </h1>

    <p className="masthead__sub">
      {switch amendment {
      | Some(name) =>
        <>
          <span className="struck"> {React.string(base.header.subtitle)} </span>
          <span className="amend">
            <span className="amend__caret" ariaHidden=true> {React.string(`↳`)} </span>
            {React.string(t.header.subtitle)}
            <span className="amend__prov"> {React.string(`?flavor=${name}`)} </span>
          </span>
        </>
      | None => React.string(t.header.subtitle)
      }}
    </p>

    <Entry.Fields
      rows=[
        Entry.Fields.node(
          r.fields.location,
          <>
            {React.string(t.header.location)}
            {React.string(`  ·  `)}
            <TokyoClock />
          </>,
        ),
        Entry.Fields.text(r.fields.resident, residency),
        Entry.Fields.text(r.fields.languages, t.about.languagesContent),
        Entry.Fields.text(r.fields.record, summary),
        Entry.Fields.node(
          r.fields.site,
          <a href={normalizeUrl(t.header.website)} rel="me">
            {React.string(t.header.website)}
          </a>,
        ),
      ]
    />
  </header>
}
