let card = (index, exp: Translations.job) =>
  <article
    key={Int.toString(index)}
    className="group flex h-full w-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-medium">
    <div className="mb-4 flex items-start justify-between gap-3">
      <span
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <LucideReact.Briefcase className="h-5 w-5" />
      </span>
      <span
        className="rounded-full border border-border px-2.5 py-1 font-mono text-[0.7rem] text-muted-foreground">
        {React.string(exp.period)}
      </span>
    </div>
    <h3 className="font-display text-lg font-bold leading-snug text-foreground">
      {React.string(exp.title)}
    </h3>
    <p className="mt-1 text-sm font-medium text-primary"> {React.string(exp.company)} </p>
    <ul className="mt-4 space-y-2">
      {exp.responsibilities
      ->Array.mapWithIndex((resp, idx) =>
        <li
          key={Int.toString(idx)}
          className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
          <span className="mt-[0.5rem] h-1 w-1 shrink-0 rounded-full bg-primary/60" ariaHidden=true />
          {React.string(resp)}
        </li>
      )
      ->React.array}
    </ul>
  </article>

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()

  <section id="experience" className="scroll-mt-24 border-t border-border py-14 sm:py-16">
    <Reveal>
      <SectionHeading index="02" title={t.experience.title} />
    </Reveal>
    <Reveal delay=80>
      <Carousel
        ariaLabel={t.experience.title}
        itemClassName="flex w-[86%] sm:w-[27rem]"
        stretch=false
        items={t.experience.jobs->Array.mapWithIndex((exp, i) => card(i, exp))}
      />
    </Reveal>
  </section>
}
