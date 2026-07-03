let baseUrl: string = %raw(`import.meta.env.BASE_URL`)

let openUrl: string => unit = %raw(`function(url) { window.open(url, '_blank') }`)

let handleDownload = (language, ext) => {
  let lang = Translations.languageToString(language)
  let fileName = `resume-${Flavor.artifactPrefix(lang)}${lang}.${ext}`
  let fullPath = `${baseUrl}${fileName}?t=${Int.toString(Date.now()->Float.toInt)}`
  openUrl(fullPath)
}

let normalizeUrl = url =>
  if Js.String2.startsWith(url, "http") {
    url
  } else {
    "https://" ++ url
  }

let contactRow = (icon, label, value) =>
  <div className="flex items-center gap-3">
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
      ariaHidden=true>
      {icon}
    </span>
    <div className="min-w-0">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
        {React.string(label)}
      </p>
      <div className="text-foreground"> {value} </div>
    </div>
  </div>

let downloadButton = (icon, label, onClick) =>
  <button
    type_="button"
    onClick
    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform duration-200 hover:scale-[1.03]">
    {icon}
    {React.string(label)}
  </button>

@react.component
let make = () => {
  let {language, translations: t} = LanguageContext.useLanguage()

  <section id="contact" className="scroll-mt-24 border-t border-border py-14 sm:py-16">
    <Reveal>
      <SectionHeading index="06" title={t.contact.title} />
    </Reveal>
    <Reveal delay=80>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="grid md:grid-cols-2">
          <div className="p-6 sm:p-8">
            <h3 className="font-display text-lg font-bold text-foreground">
              {React.string(t.contact.getInTouch)}
            </h3>
            <button
              type_="button"
              onClick={_ => ChatWidget.openChat()}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow transition-transform duration-200 hover:scale-[1.03]">
              <LucideReact.MessageCircle className="h-4 w-4" />
              {React.string(t.chat.launcher)}
            </button>
            <div className="mt-6 space-y-4">
              {contactRow(
                <LucideReact.MapPin className="h-5 w-5" />,
                "Location",
                <span className="text-muted-foreground"> {React.string(t.header.location)} </span>,
              )}
              {contactRow(
                <LucideReact.Globe className="h-5 w-5" />,
                "Website",
                <a
                  href={normalizeUrl(t.header.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary transition-colors hover:underline">
                  {React.string(t.header.website)}
                </a>,
              )}
            </div>
          </div>

          <div className="border-t border-border bg-secondary/40 p-6 sm:border-l sm:border-t-0 sm:p-8">
            <h3 className="font-display text-lg font-bold text-foreground">
              {React.string(t.contact.findMeOn)}
            </h3>
            <div className="mt-5 flex gap-3">
              {switch t.contact.socialLinks {
              | Some(links) =>
                links
                ->Array.map(link =>
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary"
                    ariaLabel={link.name}>
                    {switch link.name {
                    | "LinkedIn" => <LucideReact.Linkedin className="h-5 w-5" />
                    | "GitHub" => <LucideReact.Github className="h-5 w-5" />
                    | name => React.string(name)
                    }}
                  </a>
                )
                ->React.array
              | None => React.null
              }}
            </div>

            <p className="mt-7 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
              {React.string(t.header.downloadResume)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {downloadButton(
                <LucideReact.FileDown className="h-4 w-4" />,
                switch t.header.downloadPdf {
                | Some(label) => label
                | None => "PDF"
                },
                _ => handleDownload(language, "pdf"),
              )}
              {downloadButton(
                <LucideReact.FileText className="h-4 w-4" />,
                switch t.header.downloadDocx {
                | Some(label) => label
                | None => "DOCX"
                },
                _ => handleDownload(language, "docx"),
              )}
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  </section>
}
