@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()

  <section id="experience" className="mb-8">
    <h2 className="text-xl font-bold mb-4 text-primary border-b border-border pb-2">
      {React.string(t.experience.title)}
    </h2>
    <div className="space-y-4">
      {t.experience.jobs
      ->Array.mapWithIndex((exp, index) =>
        <UI.Card key={Int.toString(index)} className="bg-card border-border">
          <UI.CardContent className="p-4 md:p-5">
            <div className="flex flex-col md:flex-row justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {React.string(exp.title)}
                </h3>
                <p className="text-primary font-medium text-sm">
                  {React.string(exp.company)}
                </p>
              </div>
              <div className="mt-1 md:mt-0">
                <span
                  className="inline-block bg-secondary text-muted-foreground rounded-full px-2.5 py-0.5 text-xs font-semibold">
                  {React.string(exp.period)}
                </span>
              </div>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-foreground text-base">
              {exp.responsibilities
              ->Array.mapWithIndex((resp, idx) =>
                <li key={Int.toString(idx)}> {React.string(resp)} </li>
              )
              ->React.array}
            </ul>
          </UI.CardContent>
        </UI.Card>
      )
      ->React.array}
    </div>
  </section>
}
