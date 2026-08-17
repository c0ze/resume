// The works. What it is, what it was built with, and where the source is when
// the source is public. Three of the ten have public repositories; the rest say
// so by omission rather than by a dead link.

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()
  let r = t.record

  <Section id="projects">
    {t.projects.entries
    ->Array.mapWithIndex((project, i) =>
      <article key={Int.toString(i)} className="entry">
        <div className="entry__head">
          <h3 className="t-h3"> {React.string(project.title)} </h3>
        </div>

        <p className="entry__abstract measure t-body"> {React.string(project.description)} </p>

        <p className="linkrow t-meta mt-2">
          <span className="t-label"> {React.string(r.stack)} </span>
          <span> {React.string(project.technologies)} </span>
        </p>

        {switch project.repo->Js.Nullable.toOption {
        | Some(url) =>
          <p className="linkrow mt-1">
            <a href={url} target="_blank" rel="noopener noreferrer">
              {React.string(url->String.replace("https://", ""))}
            </a>
          </p>
        | None => React.null
        }}
      </article>
    )
    ->React.array}
  </Section>
}
