// Projects. Each one: what it is, what it was built with (the italic line,
// because a stack is a list of names), and where the source is when the
// source is public. Projects without a public repository say so by omission
// rather than by a dead link.

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()

  <Section id="projects" title={t.projects.title}>
    {t.projects.entries
    ->Array.mapWithIndex((project, i) =>
      // The stack's names are the same in every language (English product
      // names): lang="en".
      <Section.Entry
        key={Int.toString(i)} title={project.title} note={project.technologies} noteLang="en">
        <p className="entry__lead ix-small"> {React.string(project.description)} </p>
        {switch project.repo->Nullable.toOption {
        | Some(url) =>
          <p className="entry__links ix-small">
            <Section.External href=url className="url-text">
              {React.string(url->String.replace("https://", ""))}
            </Section.External>
          </p>
        | None => React.null
        }}
      </Section.Entry>
    )
    ->React.array}
  </Section>
}
