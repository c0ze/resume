let entry = (index, edu: Translations.educationEntry) =>
  <Reveal key={Int.toString(index)} delay={index * 80}>
    <article
      className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:border-primary/40 hover:shadow-medium sm:p-7">
      <div className="flex items-start gap-4">
        <UI.Logo
          logo={edu.logo}
          tile="h-12 w-12 rounded-xl"
          fallback={<LucideReact.GraduationCap className="h-6 w-6" />}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="font-display text-lg font-bold leading-tight text-foreground">
              {React.string(edu.degree)}
            </h3>
            <span className="shrink-0 font-mono text-xs text-muted-foreground">
              {React.string(edu.period)}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-primary"> {React.string(edu.institution)} </p>
        </div>
      </div>

      {switch edu.description->Js.Nullable.toOption {
      | Some(desc) if desc !== "" =>
        <p className="mt-4 leading-relaxed text-muted-foreground"> {React.string(desc)} </p>
      | _ => React.null
      }}

      {switch edu.links {
      | Some(links) if Array.length(links) > 0 =>
        <div className="mt-4 flex flex-wrap gap-2">
          {links
          ->Array.map(link =>
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary">
              <LucideReact.Github className="h-3.5 w-3.5" />
              {React.string(link.label)}
              <LucideReact.ArrowUpRight className="h-3 w-3 opacity-60" />
            </a>
          )
          ->React.array}
        </div>
      | _ => React.null
      }}

      {switch edu.additionalInfo->Js.Nullable.toOption {
      | Some(info) =>
        <div className="mt-4 rounded-xl border border-border bg-secondary/40 p-4">
          <h4
            className="mb-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
            {React.string(info.title)}
          </h4>
          <ul className="space-y-1.5">
            {info.items
            ->Array.mapWithIndex((item, idx) =>
              <li
                key={Int.toString(idx)}
                className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                <span
                  className="mt-[0.5rem] h-1 w-1 shrink-0 rounded-full bg-primary/60" ariaHidden=true
                />
                {React.string(item)}
              </li>
            )
            ->React.array}
          </ul>
        </div>
      | None => React.null
      }}
    </article>
  </Reveal>

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()

  <section id="education" className="scroll-mt-24 border-t border-border py-14 sm:py-16">
    <Reveal>
      <SectionHeading index="03" title={t.education.title} />
    </Reveal>
    <div className="space-y-5">
      {t.education.entries->Array.mapWithIndex((edu, i) => entry(i, edu))->React.array}
    </div>
  </section>
}
