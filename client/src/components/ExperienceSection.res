// Experience. One entry per engagement: the role in Spectral 600 with the
// period in mono at the far right, the employer and place in italics under
// it, the abstract, and every responsibility in small text. The whole record
// is in the prerendered HTML: nothing is behind a click.
//
// `abstract` is web-only; the PDF/DOCX/JSON generators ignore it.

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()

  <Section id="experience" title={t.experience.title}>
    {t.experience.jobs
    ->Array.mapWithIndex((job, i) =>
      <Section.Entry
        key={Int.toString(i)}
        title={job.title}
        meta={Section.period(job.period)}
        note={Section.place(job.company)}>
        {switch job.abstract {
        | Some(a) if a !== "" => <p className="entry__lead ix-small"> {React.string(a)} </p>
        | _ => React.null
        }}
        <ul className="entry__list ix-small">
          {job.responsibilities
          ->Array.mapWithIndex((resp, j) => <li key={Int.toString(j)}> {React.string(resp)} </li>)
          ->React.array}
        </ul>
      </Section.Entry>
    )
    ->React.array}
  </Section>
}
