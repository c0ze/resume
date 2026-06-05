let entry = (index, isLast, edu: Translations.educationEntry) =>
  <Reveal key={Int.toString(index)} delay={index * 80} className="grid grid-cols-[auto_1fr] gap-x-4">
    <div className="flex flex-col items-center" ariaHidden=true>
      <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-primary bg-background" />
      {isLast ? React.null : <span className="mt-1 w-px flex-1 bg-border" />}
    </div>
    <div className={isLast ? "pb-0" : "pb-10"}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-display text-lg font-bold leading-none text-foreground">
          {React.string(edu.degree)}
        </h3>
        <span className="font-mono text-xs text-muted-foreground"> {React.string(edu.period)} </span>
      </div>
      <p className="mt-1.5 text-sm font-medium text-primary"> {React.string(edu.institution)} </p>
      {switch edu.description->Js.Nullable.toOption {
      | Some(desc) if desc !== "" =>
        <p className="mt-2 leading-relaxed text-muted-foreground"> {React.string(desc)} </p>
      | _ => React.null
      }}
      {switch edu.additionalInfo->Js.Nullable.toOption {
      | Some(info) =>
        <div className="mt-3 rounded-xl border border-border bg-secondary/40 p-4">
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
    </div>
  </Reveal>

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()
  let lastIndex = Array.length(t.education.entries) - 1

  <section id="education" className="scroll-mt-24 border-t border-border py-14 sm:py-16">
    <Reveal>
      <SectionHeading index="03" title={t.education.title} />
    </Reveal>
    <div>
      {t.education.entries
      ->Array.mapWithIndex((edu, i) => entry(i, i == lastIndex, edu))
      ->React.array}
    </div>
  </section>
}
