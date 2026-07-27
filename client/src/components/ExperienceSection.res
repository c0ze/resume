// Entry 02 — the Record of Service.
//
// It opens with the register: every engagement on one ruled table, scannable in
// the forty seconds a recruiter actually has, each row citing the page its full
// entry is written on. Then every engagement is written out in full, inline. A
// bound record shows everything; nothing here is hidden behind a click.

let anchor = i => `experience-${Int.toString(i + 1)}`

let subNumber = i => `02.${Int.toString(i + 1)}`

@react.component
let make = (~folios: Folio.t) => {
  let {translations: t} = LanguageContext.useLanguage()
  let r = t.record
  let jobs = t.experience.jobs
  let periods = jobs->Array.map(j => j.period)

  <>
    <Entry id="experience" number="02" folio={folios.service} major=true>
      <Entry.Head
        title={t.experience.title}
        meta={<span className="t-data pencil">
          {React.string(
            `${Int.toString(Array.length(jobs))} ${r.entriesLabel} · ${Period.format(
                periods,
              )} · ${r.pagesLabel} ${Folio.pad(folios.service)}–${Folio.pad(
                folios.job(Array.length(jobs) - 1),
              )}`,
          )}
        </span>}
      />

      <div className="schedule-wrap">
        <table className="schedule">
          <caption> {React.string(r.register)} </caption>
          <thead>
            <tr>
              <th scope="col" className="col-no"> {React.string(r.columns.no)} </th>
              <th scope="col" className="col-per"> {React.string(r.columns.period)} </th>
              <th scope="col" className="col-org"> {React.string(r.columns.organisation)} </th>
              <th scope="col" className="col-title"> {React.string(r.columns.title)} </th>
              <th scope="col" className="col-page"> {React.string(r.columns.page)} </th>
            </tr>
          </thead>
          <tbody>
            {jobs
            ->Array.mapWithIndex((job, i) =>
              <tr key={Int.toString(i)}>
                <td className="col-no"> {React.string(subNumber(i))} </td>
                <td className="col-per"> {React.string(job.period)} </td>
                <td className="col-org"> {React.string(job.company)} </td>
                <td className="col-title">
                  <a href={`#${anchor(i)}`} title={t.experience.viewDetails}>
                    {React.string(job.title)}
                  </a>
                </td>
                <td className="col-page"> {React.string(Folio.pad(folios.job(i)))} </td>
              </tr>
            )
            ->React.array}
          </tbody>
        </table>
      </div>
      <p className="footnote"> {React.string(r.registerNote)} </p>
    </Entry>

    {jobs
    ->Array.mapWithIndex((job, i) => {
      let fields = Array.concat(
        [
          Entry.Fields.text(r.fields.organisation, job.company),
          Entry.Fields.text(r.fields.period, job.period),
        ],
        switch job.abstract {
        | Some(a) if a !== "" => [Entry.Fields.prose(r.fields.abstract, a)]
        | _ => []
        },
      )

      <Entry
        key={Int.toString(i)}
        id={anchor(i)}
        number={subNumber(i)}
        folio={folios.job(i)}
        logo={job.logo}>
        <Entry.Head
          sub=true
          title={job.title}
          meta={<span className="t-data"> {React.string(job.period)} </span>}
        />
        <Entry.Fields rows=fields />
        <ul className="record">
          {job.responsibilities
          ->Array.mapWithIndex((resp, j) =>
            <li key={Int.toString(j)} className="t-body"> {React.string(resp)} </li>
          )
          ->React.array}
        </ul>
      </Entry>
    })
    ->React.array}
  </>
}
