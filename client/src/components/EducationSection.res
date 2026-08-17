// Education. The early end of the span is the unusual part of this record —
// four first-author papers on a hardware code-compression technique, Verilog on
// a MIPS R3000 core synthesised to 90nm — so the papers are set as citations in
// their own list rather than buried in the paragraph above them.

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

  <Section id="education">
    {t.education.entries
    ->Array.mapWithIndex((edu, i) =>
      <article
        key={Int.toString(i)} id={`education-${Int.toString(i + 1)}`} className="entry">
        <div className="entry__head">
          <h3 className="t-h3"> {React.string(edu.degree)} </h3>
          <span className="entry__period"> {React.string(edu.period)} </span>
        </div>

        <div className="entry__org">
          <Mark logo={edu.logo} />
          {React.string(edu.institution)}
        </div>

        {switch edu.description->Js.Nullable.toOption {
        | Some(desc) if desc !== "" =>
          <p className="entry__abstract measure t-body"> {React.string(desc)} </p>
        | _ => React.null
        }}

        {switch edu.links {
        | Some(links) if Array.length(links) > 0 =>
          <p className="linkrow mt-2">
            {links
            ->Array.map(link =>
              <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                {React.string(link.label)}
              </a>
            )
            ->React.array}
          </p>
        | _ => React.null
        }}

        {switch edu.additionalInfo->Js.Nullable.toOption {
        | Some(info) =>
          <>
            <p className="t-label mt-4"> {React.string(info.title)} </p>
            <ul className="papers measure">
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
      </article>
    )
    ->React.array}
  </Section>
}
