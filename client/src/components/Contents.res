// Entry 00 — the contents index that opens the document. Dot leaders, entry
// numbers, spans and page refs. This is the navigation: a bound record is found
// by its index, not by a floating pill bar.

type row = {
  no: string,
  title: string,
  meta: string,
  page: int,
  anchor: string,
}

@react.component
let make = (~folios: Folio.t) => {
  let {language, translations: t} = LanguageContext.useLanguage()
  let r = t.record

  let pair = {
    let code = l => Translations.languageToString(l)->String.toUpperCase
    `${code(language)} / ${code(AboutSection.companion(language))}`
  }

  let jobPeriods = t.experience.jobs->Array.map(j => j.period)
  let eduPeriods = t.education.entries->Array.map(e => e.period)
  let count = n => `${Int.toString(n)} ${r.entriesLabel}`

  let rows = [
    {
      no: "01",
      title: t.about.title,
      meta: pair,
      page: folios.statement,
      anchor: "about",
    },
    {
      no: "02",
      title: t.experience.title,
      meta: Period.format(jobPeriods),
      page: folios.service,
      anchor: "experience",
    },
    {
      no: "03",
      title: t.skills.title,
      meta: count(Array.length(t.skills.technicalSkills)),
      page: folios.skills,
      anchor: "skills",
    },
    {
      no: "04",
      title: t.projects.title,
      meta: count(Array.length(t.projects.entries)),
      page: folios.works,
      anchor: "projects",
    },
    {
      no: "05",
      title: t.education.title,
      meta: Period.format(eduPeriods),
      page: folios.education,
      anchor: "education",
    },
    {
      no: "06",
      title: t.contact.title,
      meta: Build.issuedOn,
      page: folios.issue,
      anchor: "contact",
    },
  ]

  <Entry number="00" folio={folios.index}>
    <Entry.Head
      title={r.contents}
      meta={<span className="t-data pencil"> {React.string(count(Array.length(rows)))} </span>}
    />
    <nav className="contents" ariaLabel={r.contents}>
      {rows
      ->Array.map(row =>
        <a key={row.no} className="toc-row" href={`#${row.anchor}`}>
          <span className="toc-no"> {React.string(row.no)} </span>
          <span className="toc-title"> {React.string(row.title)} </span>
          <span className="toc-lead" ariaHidden=true />
          <span className="toc-dates"> {React.string(row.meta)} </span>
          <span className="toc-page"> {React.string(Folio.ref(row.page))} </span>
        </a>
      )
      ->React.array}
    </nav>
  </Entry>
}
