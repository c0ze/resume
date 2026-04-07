@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()

  <section id="projects" className="mb-8">
    <h2 className="text-xl font-bold mb-4 text-primary border-b border-border pb-2">
      {React.string(t.projects.title)}
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {t.projects.entries
      ->Array.mapWithIndex((project, index) =>
        <UI.Card
          key={Int.toString(index)} className="overflow-hidden flex flex-col bg-card border-border">
          <UI.CardContent className="p-4 md:p-5 flex-grow">
            <h3 className="text-base font-bold mb-1 text-foreground">
              {React.string(project.title)}
            </h3>
            <p className="text-foreground mb-3 text-base leading-relaxed">
              {React.string(project.description)}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {project.technologies
              ->String.split(",")
              ->Array.filterMap(tech => {
                let trimmed = String.trim(tech)
                if trimmed !== "" {
                  Some(trimmed)
                } else {
                  None
                }
              })
              ->Array.mapWithIndex((tech, idx) =>
                <span
                  key={Int.toString(idx)}
                  className="bg-primary/10 text-primary rounded px-2 py-0.5 text-xs font-medium">
                  {React.string(tech)}
                </span>
              )
              ->React.array}
            </div>
          </UI.CardContent>
        </UI.Card>
      )
      ->React.array}
    </div>
  </section>
}
