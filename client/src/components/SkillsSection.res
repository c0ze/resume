// Entry 03 — competencies, as a numbered sub-record. No bars, no ratings, no
// logo grid: a claim about a skill is either a sentence you can check against
// the entries above it or it is decoration.

@react.component
let make = (~folios: Folio.t) => {
  let {translations: t} = LanguageContext.useLanguage()
  let skills = t.skills.technicalSkills

  <Entry id="skills" number="03" folio={folios.skills} major=true>
    <Entry.Head
      title={t.skills.title}
      meta={<span className="t-data pencil">
        {React.string(`${Int.toString(Array.length(skills))} ${t.record.entriesLabel}`)}
      </span>}
    />
    {Array.length(skills) === 0
      ? React.null
      : <ul className="record">
          {skills
          ->Array.mapWithIndex((skill, i) =>
            <li key={Int.toString(i)} className="t-body"> {React.string(skill)} </li>
          )
          ->React.array}
        </ul>}
  </Entry>
}
