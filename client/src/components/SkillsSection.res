// Competencies as sentences. No bars, no percentages, no ratings, no logo
// grid: a claim about a skill is either something a reader can check against
// the engagements above it or it is decoration.

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()
  let skills = t.skills.technicalSkills

  <Section id="skills">
    {Array.length(skills) === 0
      ? React.null
      : <ul className="list measure">
          {skills
          ->Array.mapWithIndex((skill, i) =>
            <li key={Int.toString(i)} className="t-body"> {React.string(skill)} </li>
          )
          ->React.array}
        </ul>}
  </Section>
}
