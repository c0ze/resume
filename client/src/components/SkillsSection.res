// Skills, as numbered sentences. No bars, no ratings, no logo grid: a claim
// about a skill is either a sentence you can check against the entries around
// it or it is decoration.

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()

  <Section id="skills" title={t.skills.title}>
    <ol className="skills">
      {t.skills.technicalSkills
      ->Array.mapWithIndex((skill, i) =>
        <li key={Int.toString(i)} className="row">
          <span className="row__gutter" ariaHidden=true> {React.string(Section.pad(i))} </span>
          <p className="row__body"> {React.string(skill)} </p>
        </li>
      )
      ->React.array}
    </ol>
  </Section>
}
