// Card preview text: the abstract when present (EN), else the first
// responsibility (graceful fallback for not-yet-translated JA/TR).
let preview = (job: Translations.job) =>
  switch job.abstract {
  | Some(a) if a !== "" => a
  | _ =>
    switch job.responsibilities->Array.get(0) {
    | Some(first) => first
    | None => ""
    }
  }

let responsibilityList = (job: Translations.job) =>
  <ul className="space-y-2.5">
    {job.responsibilities
    ->Array.mapWithIndex((resp, idx) =>
      <li
        key={Int.toString(idx)}
        className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
        <span className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-primary/60" ariaHidden=true />
        {React.string(resp)}
      </li>
    )
    ->React.array}
  </ul>

let card = (i, onOpen, viewDetails, job: Translations.job) =>
  <article key={Int.toString(i)} className="flex h-full w-full flex-col">
    <button
      type_="button"
      onClick={_ => onOpen(i)}
      className="group flex h-full w-full flex-col rounded-2xl border border-border bg-card p-6 text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-medium print:hidden">
      <div className="mb-4 flex items-start justify-between gap-3">
        <UI.Logo
          logo={job.logo}
          tile="h-10 w-10 rounded-xl"
          fallback={<LucideReact.Briefcase className="h-5 w-5" />}
        />
        <span
          className="rounded-full border border-border px-2.5 py-1 font-mono text-[0.7rem] text-muted-foreground">
          {React.string(job.period)}
        </span>
      </div>
      <h3 className="font-display text-lg font-bold leading-snug text-foreground">
        {React.string(job.title)}
      </h3>
      <p className="mt-1 text-sm font-medium text-primary"> {React.string(job.company)} </p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {React.string(preview(job))}
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        {React.string(viewDetails)}
        <LucideReact.ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>

    <div className="hidden print:block">
      <h3 className="text-base font-bold text-foreground"> {React.string(job.title)} </h3>
      <p className="text-sm font-medium text-primary"> {React.string(job.company)} </p>
      <p className="font-mono text-xs text-muted-foreground"> {React.string(job.period)} </p>
      <div className="mt-2"> {responsibilityList(job)} </div>
    </div>
  </article>

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()
  let (openIndex, setOpenIndex) = React.useState(() => None)

  let onOpen = i => setOpenIndex(_ => Some(i))
  let onClose = () => setOpenIndex(_ => None)

  let selected = switch openIndex {
  | Some(i) => t.experience.jobs->Array.get(i)
  | None => None
  }

  <section id="experience" className="scroll-mt-24 border-t border-border py-14 sm:py-16">
    <Reveal>
      <SectionHeading index="02" title={t.experience.title} />
    </Reveal>
    <Reveal delay=80>
      <Carousel
        ariaLabel={t.experience.title}
        itemClassName="flex w-[84%] sm:w-[22rem]"
        items={t.experience.jobs->Array.mapWithIndex((job, i) =>
          card(i, onOpen, t.experience.viewDetails, job)
        )}
      />
    </Reveal>

    <Modal
      isOpen={Option.isSome(openIndex)}
      onClose
      labelledBy="experience-modal-title"
      closeLabel={t.experience.close}>
      {switch selected {
      | Some(job) =>
        <>
          <div
            className="relative shrink-0 overflow-hidden border-b border-border bg-muted/40 px-6 pb-6 pt-7 sm:px-8">
            <div ariaHidden=true className="pointer-events-none absolute inset-0 dossier-grid opacity-60" />
            <div
              ariaHidden=true
              className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-primary/15 blur-3xl"
            />
            <div className="relative">
              <UI.Logo
                logo={job.logo}
                tile="h-12 w-12 rounded-2xl"
                fallback={<LucideReact.Briefcase className="h-6 w-6" />}
              />
              <h3
                id="experience-modal-title"
                className="mt-4 pr-10 font-display text-2xl font-bold leading-tight tracking-tight text-foreground">
                {React.string(job.title)}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span className="text-sm font-semibold text-primary"> {React.string(job.company)} </span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" ariaHidden=true />
                <span
                  className="rounded-full border border-border bg-card/60 px-2.5 py-0.5 font-mono text-[0.7rem] text-muted-foreground">
                  {React.string(job.period)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
            {switch job.abstract {
            | Some(a) if a !== "" =>
              <>
                <p className="text-[1.05rem] leading-relaxed text-foreground"> {React.string(a)} </p>
                <div className="my-6 h-px bg-border" />
              </>
            | _ => React.null
            }}
            <ul className="space-y-3.5">
              {job.responsibilities
              ->Array.mapWithIndex((resp, idx) =>
                <li key={Int.toString(idx)} className="flex gap-3">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"
                    ariaHidden=true>
                    <LucideReact.Check className="h-3 w-3" />
                  </span>
                  <span className="text-sm leading-relaxed text-foreground"> {React.string(resp)} </span>
                </li>
              )
              ->React.array}
            </ul>
          </div>
        </>
      | None => React.null
      }}
    </Modal>
  </section>
}
