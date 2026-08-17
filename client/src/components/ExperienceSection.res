// Nine engagements, all Tokyo, written out in full and in order.
//
// Nothing is hidden behind a "view details" click: every responsibility is in
// the prerendered HTML, which is what makes the page work without JavaScript
// and what lets a recruiter's ⌘F actually find a technology. The current role
// is the one thing a reader looks for first, so it is the single place in the
// document where the accent marks a fact rather than an affordance.

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()

  <Section id="experience">
    {t.experience.jobs
    ->Array.mapWithIndex((job, i) => {
      let current = Period.isOpen(job.period)

      <article
        key={Int.toString(i)}
        id={`experience-${Int.toString(i + 1)}`}
        className={current ? "entry entry--current" : "entry"}>
        <div className="entry__head">
          <h3 className="t-h3"> {React.string(job.title)} </h3>
          <span className="entry__period"> {React.string(job.period)} </span>
        </div>

        <div className="entry__org">
          <Mark logo={job.logo} />
          {React.string(job.company)}
        </div>

        {switch job.abstract {
        | Some(a) if a !== "" =>
          <p className="entry__abstract measure t-body"> {React.string(a)} </p>
        | _ => React.null
        }}

        {Array.length(job.responsibilities) === 0
          ? React.null
          : <ul className="list measure">
              {job.responsibilities
              ->Array.mapWithIndex((resp, j) =>
                <li key={Int.toString(j)} className="t-body"> {React.string(resp)} </li>
              )
              ->React.array}
            </ul>}
      </article>
    })
    ->React.array}
  </Section>
}
