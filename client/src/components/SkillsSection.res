@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()

  <section id="skills" className="mb-8">
    <h2 className="text-xl font-bold mb-4 text-primary border-b border-border pb-2">
      {React.string(t.skills.title)}
    </h2>
    <UI.Card className="bg-card border-border">
      <UI.CardContent className="p-4 md:p-5">
        {if Array.length(t.skills.technicalSkills) > 0 {
          <ul className="space-y-1.5">
            {t.skills.technicalSkills
            ->Array.mapWithIndex((skill, index) =>
              <li
                key={Int.toString(index)}
                className="flex items-start gap-2 text-foreground text-base">
                <span
                  className="text-primary mt-1.5 shrink-0 block w-1.5 h-1.5 rounded-full bg-primary"
                />
                {React.string(skill)}
              </li>
            )
            ->React.array}
          </ul>
        } else {
          <p className="text-muted-foreground"> {React.string("No skills listed.")} </p>
        }}
      </UI.CardContent>
    </UI.Card>
  </section>
}
