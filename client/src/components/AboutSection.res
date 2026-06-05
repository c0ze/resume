@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()

  <section id="about" className="scroll-mt-24 py-14 sm:py-16">
    <Reveal>
      <SectionHeading index="01" title={t.about.title} />
    </Reveal>
    <div className="grid gap-8 md:grid-cols-3">
      <Reveal delay=80 className="md:col-span-2">
        <p className="text-lg leading-relaxed text-foreground sm:text-xl">
          {React.string(t.about.paragraph1)}
        </p>
        {switch t.about.paragraph2 {
        | Some(p2) if p2 !== "" =>
          <p className="mt-4 leading-relaxed text-muted-foreground"> {React.string(p2)} </p>
        | _ => React.null
        }}
      </Reveal>
      <Reveal delay=160>
        <div className="glass h-full rounded-2xl p-5">
          <div
            className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-primary">
            <LucideReact.Languages className="h-4 w-4" />
            {React.string(t.about.languages)}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {React.string(t.about.languagesContent)}
          </p>
        </div>
      </Reveal>
    </div>
  </section>
}
