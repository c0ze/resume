// Skills, as sentences. No bars, no ratings, no logo grid: a claim about a
// skill is either a sentence you can check against the entries around it or
// it is decoration.

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()

  <Section id="skills" title={t.skills.title}>
    <ul className="plain rows">
      {t.skills.technicalSkills
      ->Array.mapWithIndex((skill, i) => <li key={Int.toString(i)}> {React.string(skill)} </li>)
      ->React.array}
    </ul>
  </Section>
}
