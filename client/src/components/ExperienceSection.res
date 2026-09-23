// Experience. One row per engagement: the period in mono on the left, the role
// and employer on the right, then the abstract and every responsibility. The
// whole record is in the prerendered HTML — nothing is behind a click.
//
// `abstract` is web-only; the PDF/DOCX/JSON generators ignore it.

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()

  <Section id="experience" title={t.experience.title}>
    {t.experience.jobs
    ->Array.mapWithIndex((job, i) =>
      <Section.Row key={Int.toString(i)} gutter={React.string(Section.period(job.period))}>
        <h3 className="row__title">
          {React.string(job.title)}
          <span className="row__org"> {React.string(` · ${Section.place(job.company)}`)} </span>
        </h3>
        {switch job.abstract {
        | Some(a) if a !== "" => <p className="row__lead"> {React.string(a)} </p>
        | _ => React.null
        }}
        <ul className="row__list">
          {job.responsibilities
          ->Array.mapWithIndex((resp, j) => <li key={Int.toString(j)}> {React.string(resp)} </li>)
          ->React.array}
        </ul>
      </Section.Row>
    )
    ->React.array}
  </Section>
}
