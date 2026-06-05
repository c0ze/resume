@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()

  <section id="skills" className="scroll-mt-24 border-t border-border py-14 sm:py-16">
    <Reveal>
      <SectionHeading index="04" title={t.skills.title} />
    </Reveal>
    {if Array.length(t.skills.technicalSkills) > 0 {
      <Reveal delay=80>
        <div className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
          {t.skills.technicalSkills
          ->Array.mapWithIndex((skill, index) =>
            <div key={Int.toString(index)} className="flex gap-3">
              <span
                className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"
                ariaHidden=true>
                <LucideReact.Terminal className="h-3 w-3" />
              </span>
              <p className="text-[0.95rem] leading-relaxed text-foreground"> {React.string(skill)} </p>
            </div>
          )
          ->React.array}
        </div>
      </Reveal>
    } else {
      <p className="text-muted-foreground"> {React.string("No skills listed.")} </p>
    }}
  </section>
}
