let techTags = technologies =>
  technologies
  ->String.split(",")
  ->Array.filterMap(tech => {
    let trimmed = String.trim(tech)
    trimmed === "" ? None : Some(trimmed)
  })

let card = (index, project: Translations.projectEntry) =>
  <article
    key={Int.toString(index)}
    className="group flex h-full w-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-medium">
    <span
      className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
      ariaHidden=true>
      <LucideReact.FolderGit2 className="h-5 w-5" />
    </span>
    <h3 className="font-display text-base font-bold leading-snug text-foreground">
      {React.string(project.title)}
    </h3>
    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
      {React.string(project.description)}
    </p>
    <div className="mt-4 flex flex-wrap gap-1.5">
      {techTags(project.technologies)
      ->Array.mapWithIndex((tech, idx) =>
        <span
          key={Int.toString(idx)}
          className="rounded-full border border-border bg-secondary/50 px-2 py-0.5 font-mono text-[0.7rem] text-muted-foreground">
          {React.string(tech)}
        </span>
      )
      ->React.array}
    </div>
  </article>

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()

  <section id="projects" className="scroll-mt-24 border-t border-border py-14 sm:py-16">
    <Reveal>
      <SectionHeading index="05" title={t.projects.title} />
    </Reveal>
    <Reveal delay=80>
      <Carousel
        ariaLabel={t.projects.title}
        itemClassName="flex w-[85%] sm:w-[22rem]"
        items={t.projects.entries->Array.mapWithIndex((project, i) => card(i, project))}
      />
    </Reveal>
  </section>
}
