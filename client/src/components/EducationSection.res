// Entry 05 — education. The early end of the span is the unusual part of this
// record, so the papers are set as citations in their own ruled list rather
// than buried in a paragraph.

// Paper items are stored as "2011: Title (Venue)" in every language.
let splitCitation = (item: string) =>
  switch item->String.indexOf(":") {
  | -1 => ("", item)
  | at => (
      item->String.slice(~start=0, ~end=at)->String.trim,
      item->String.sliceToEnd(~start=at + 1)->String.trim,
    )
  }

let anchor = i => `education-${Int.toString(i + 1)}`

@react.component
let make = (~folios: Folio.t) => {
  let {translations: t} = LanguageContext.useLanguage()
  let r = t.record
  let entries = t.education.entries

  <>
    <Entry id="education" number="05" folio={folios.education} major=true>
      <Entry.Head
        title={t.education.title}
        meta={<span className="t-data pencil">
          {React.string(
            `${Int.toString(Array.length(entries))} ${r.entriesLabel} · ${Period.format(
                entries->Array.map(e => e.period),
              )}`,
          )}
        </span>}
      />
    </Entry>

    {entries
    ->Array.mapWithIndex((edu, i) => {
      let links = edu.links->Option.getOr([])
      let fields = Array.concat(
        [
          Entry.Fields.text(r.fields.institution, edu.institution),
          Entry.Fields.text(r.fields.period, edu.period),
        ],
        Array.length(links) === 0
          ? []
          : [
              Entry.Fields.node(
                r.fields.evidence,
                <>
                  {links
                  ->Array.mapWithIndex((link, j) =>
                    <React.Fragment key={link.url}>
                      {j === 0 ? React.null : React.string(`  ·  `)}
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        {React.string(link.label)}
                        {React.string(` ↗`)}
                      </a>
                    </React.Fragment>
                  )
                  ->React.array}
                </>,
              ),
            ],
      )

      <Entry
        key={Int.toString(i)}
        id={anchor(i)}
        number={`05.${Int.toString(i + 1)}`}
        folio={folios.degree(i)}
        logo={edu.logo}>
        <Entry.Head
          sub=true
          title={edu.degree}
          meta={<span className="t-data"> {React.string(edu.period)} </span>}
        />
        <Entry.Fields rows=fields />
        {switch edu.description->Js.Nullable.toOption {
        | Some(desc) if desc !== "" =>
          <p className="measure t-body mt-q"> {React.string(desc)} </p>
        | _ => React.null
        }}
        {switch edu.additionalInfo->Js.Nullable.toOption {
        | Some(info) =>
          <>
            <p className="t-label mt-q"> {React.string(info.title)} </p>
            <ul className="papers">
              {info.items
              ->Array.mapWithIndex((item, j) => {
                let (year, citation) = splitCitation(item)
                <li key={Int.toString(j)}>
                  <span className="yr"> {React.string(year)} </span>
                  <span> {React.string(citation)} </span>
                </li>
              })
              ->React.array}
            </ul>
          </>
        | None => React.null
        }}
      </Entry>
    })
    ->React.array}
  </>
}
