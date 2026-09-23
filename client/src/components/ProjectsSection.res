// Projects. Each one: what it is, what it was built with (the only chips on
// the page, because a stack is a list of names), and where the source is when
// the source is public. Projects without a public repository say so by
// omission rather than by a dead link.

let stack: string => array<string> = %raw(`
  function (s) { return String(s || "").split(/\s*,\s*/).filter(Boolean); }
`)

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()
  let r = t.record

  <Section id="projects" title={t.projects.title}>
    {t.projects.entries
    ->Array.mapWithIndex((project, i) =>
      <Section.Row key={Int.toString(i)} gutter={React.string(Section.pad(i))}>
        <h3 className="row__title"> {React.string(project.title)} </h3>
        <p className="row__lead"> {React.string(project.description)} </p>
        <ul className="chips" ariaLabel={r.fields.stack}>
          {stack(project.technologies)
          ->Array.map(name => <li key=name> {React.string(name)} </li>)
          ->React.array}
        </ul>
        {switch project.repo->Nullable.toOption {
        | Some(url) =>
          <p className="row__meta">
            <a href={url} target="_blank" rel="noopener noreferrer" title={t.projects.viewSource}>
              {React.string(url->String.replace("https://", ""))}
              {React.string(` ↗`)}
            </a>
          </p>
        | None => React.null
        }}
      </Section.Row>
    )
    ->React.array}
  </Section>
}
