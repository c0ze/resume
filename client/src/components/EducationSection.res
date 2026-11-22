// Education. The degree in Spectral 600 with the period in mono at the far
// right, the school in italics under it. The early end of the span is the
// unusual part of this résumé, so the papers are set as citations (year in
// mono, title after it) rather than buried in a paragraph.

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
      <Section.Entry
        key={Int.toString(i)}
        title={edu.degree}
        meta={Section.period(edu.period)}
        note={edu.institution}>
        {switch edu.description->Nullable.toOption {
        | Some(desc) if desc !== "" =>
          <p className="entry__lead ix-small"> {React.string(desc)} </p>
        | _ => React.null
        }}
        {switch edu.additionalInfo->Nullable.toOption {
        | Some(info) =>
          <div className="papers">
            <h4 className="ix-label"> {React.string(info.title)} </h4>
            <ul className="plain ix-small">
              {info.items
              ->Array.mapWithIndex((item, j) => {
                let (year, citation) = splitCitation(item)
                <li key={Int.toString(j)}>
                  <span className="ix-mono"> {React.string(year)} </span>
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
          : <div className="entry__links ix-small">
              <Astryx.HStack gap=4. wrap=#wrap>
                {links
                ->Array.map(link =>
                  <Section.External key={link.url} href={link.url}>
                    {React.string(link.label)}
                  </Section.External>
                )
                ->React.array}
              </Astryx.HStack>
            </div>}
      </Section.Entry>
    })
    ->React.array}
  </Section>
}
