// Entry 04 — the works. Each one is a numbered sub-record: what it is, what it
// was built with, and where the source is when the source is public. Three of
// the ten have public repositories; the rest say so by omission rather than by
// a dead link.

@react.component
let make = (~folios: Folio.t) => {
  let {translations: t} = LanguageContext.useLanguage()
  let r = t.record
  let entries = t.projects.entries

  <Entry id="projects" number="04" folio={folios.works} major=true>
    <Entry.Head
      title={t.projects.title}
      meta={<span className="t-data pencil">
        {React.string(`${Int.toString(Array.length(entries))} ${r.entriesLabel}`)}
      </span>}
    />
    <ul className="record">
      {entries
      ->Array.mapWithIndex((project, i) =>
        <li key={Int.toString(i)}>
          <h3 className="t-entry"> {React.string(project.title)} </h3>
          <p className="measure t-body"> {React.string(project.description)} </p>
          <p className="linklist">
            <span className="t-label"> {React.string(r.fields.stack)} </span>
            {React.string(` ${project.technologies}`)}
          </p>
          {switch project.repo->Js.Nullable.toOption {
          | Some(url) =>
            <p className="linklist">
              <span className="t-label"> {React.string(r.fields.source)} </span>
              {React.string(" ")}
              <a href={url} target="_blank" rel="noopener noreferrer">
                {React.string(url->String.replace("https://", ""))}
                {React.string(` ↗`)}
              </a>
            </p>
          | None => React.null
          }}
        </li>
      )
      ->React.array}
    </ul>
  </Entry>
}
