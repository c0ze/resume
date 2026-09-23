// Education. The early end of the span is the unusual part of this résumé, so
// the papers are set as citations — year in mono, title after it — rather than
// buried in a paragraph.

// Paper items are stored as "2011: Title (Venue)" in every language.
let splitCitation = (item: string) =>
  switch item->String.indexOf(":") {
  | -1 => ("", item)
  | at => (
      item->String.slice(~start=0, ~end=at)->String.trim,
      item->String.sliceToEnd(~start=at + 1)->String.trim,
    )
  }

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()

  <Section id="education" title={t.education.title}>
    {t.education.entries
    ->Array.mapWithIndex((edu, i) => {
      let links = edu.links->Option.getOr([])
      <Section.Row key={Int.toString(i)} gutter={React.string(Section.period(edu.period))}>
        <h3 className="row__title">
          {React.string(edu.degree)}
          <span className="row__org"> {React.string(` · ${edu.institution}`)} </span>
        </h3>
        {switch edu.description->Nullable.toOption {
        | Some(desc) if desc !== "" => <p className="row__lead"> {React.string(desc)} </p>
        | _ => React.null
        }}
        {switch edu.additionalInfo->Nullable.toOption {
        | Some(info) =>
          <div className="papers">
            <p className="papers__head"> {React.string(info.title)} </p>
            <ul>
              {info.items
              ->Array.mapWithIndex((item, j) => {
                let (year, citation) = splitCitation(item)
                <li key={Int.toString(j)}>
                  <span className="papers__yr"> {React.string(year)} </span>
                  <span> {React.string(citation)} </span>
                </li>
              })
              ->React.array}
            </ul>
          </div>
        | None => React.null
        }}
        {Array.length(links) === 0
          ? React.null
          : <p className="row__meta">
              {links
              ->Array.mapWithIndex((link, j) =>
                <React.Fragment key={link.url}>
                  {j === 0 ? React.null : <span ariaHidden=true> {React.string(` · `)} </span>}
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {React.string(link.label)}
                    {React.string(` ↗`)}
                  </a>
                </React.Fragment>
              )
              ->React.array}
            </p>}
      </Section.Row>
    })
    ->React.array}
  </Section>
}
