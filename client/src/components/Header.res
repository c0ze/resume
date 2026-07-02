let baseUrl: string = %raw(`import.meta.env.BASE_URL`)

let openUrl: string => unit = %raw(`function(url) { window.open(url, '_blank') }`)

let handleDownload = (language, ext) => {
  let lang = Translations.languageToString(language)
  let fileName = `resume-${lang}.${ext}`
  let fullPath = `${baseUrl}${fileName}?t=${Int.toString(Date.now()->Float.toInt)}`
  openUrl(fullPath)
}

/* The vCard is a single language-independent artifact. */
let handleVcardDownload = () => {
  let fullPath = `${baseUrl}arda.vcf?t=${Int.toString(Date.now()->Float.toInt)}`
  openUrl(fullPath)
}

let normalizeUrl = url =>
  if Js.String2.startsWith(url, "http") {
    url
  } else {
    "https://" ++ url
  }

let statChip = (icon, label) =>
  <span className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground">
    {icon}
    {React.string(label)}
  </span>

@react.component
let make = () => {
  let {language, translations: t} = LanguageContext.useLanguage()

  <header id="top" className="relative overflow-hidden border-b border-border">
    <div ariaHidden=true className="pointer-events-none absolute inset-0 dossier-grid opacity-80" />
    <div
      ariaHidden=true
      className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
    />

    <div className="relative mx-auto w-full max-w-5xl px-6 pb-14 pt-16 sm:pt-20">
      <div className="animate-fade-up ad-1 glass mb-7 inline-flex items-center gap-3 rounded-full px-4 py-1.5">
        <span className="flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-primary">
          <LucideReact.MapPin className="h-3.5 w-3.5" />
          {React.string(t.header.location)}
        </span>
        <span className="h-3.5 w-px bg-border" ariaHidden=true />
        <TokyoClock />
      </div>

      <h1
        className="animate-fade-up ad-2 font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
        <span className="text-gradient-primary"> {React.string(t.header.title)} </span>
      </h1>

      <p
        className="animate-fade-up ad-3 mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
        {React.string(t.header.subtitle)}
      </p>

      <div
        className="animate-fade-up ad-4 mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
        <button
          onClick={_ => ChatWidget.openChat()}
          className="group inline-flex items-center gap-2 transition-colors hover:text-primary">
          <LucideReact.MessageCircle className="h-4 w-4 text-primary" />
          {React.string(t.chat.launcher)}
        </button>
        <a
          href={normalizeUrl(t.header.website)}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 transition-colors hover:text-primary">
          <LucideReact.Globe className="h-4 w-4 text-primary" />
          {React.string(t.header.website)}
          <LucideReact.ArrowUpRight
            className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </a>
      </div>

      <div className="animate-fade-up ad-5 mt-9 flex flex-wrap gap-3">
        <button
          type_="button"
          onClick={_ => handleDownload(language, "pdf")}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow transition-transform duration-200 hover:scale-[1.03]">
          <LucideReact.FileDown className="h-4 w-4" />
          {React.string(
            switch t.header.downloadPdf {
            | Some(label) => label
            | None => "PDF"
            },
          )}
        </button>
        <button
          type_="button"
          onClick={_ => handleDownload(language, "docx")}
          className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:scale-[1.03] hover:text-primary">
          <LucideReact.FileText className="h-4 w-4" />
          {React.string(
            switch t.header.downloadDocx {
            | Some(label) => label
            | None => "DOCX"
            },
          )}
        </button>
        <button
          type_="button"
          onClick={_ => handleDownload(language, "json")}
          className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:scale-[1.03] hover:text-primary">
          <LucideReact.FileJson className="h-4 w-4" />
          {React.string(
            switch t.header.downloadJson {
            | Some(label) => label
            | None => "JSON"
            },
          )}
        </button>
        <button
          type_="button"
          onClick={_ => handleVcardDownload()}
          className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:scale-[1.03] hover:text-primary">
          <LucideReact.Contact className="h-4 w-4" />
          {React.string(
            switch t.header.downloadVcard {
            | Some(label) => label
            | None => "vCard"
            },
          )}
        </button>
      </div>

      <div
        className="animate-fade-up ad-6 mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border pt-6">
        {statChip(<LucideReact.Code2 className="h-3.5 w-3.5 text-primary" />, "Go · Ruby · Python")}
        {statChip(<LucideReact.Cpu className="h-3.5 w-3.5 text-primary" />, "AWS · GCP · Docker")}
        {statChip(<LucideReact.Languages className="h-3.5 w-3.5 text-primary" />, "EN · JA · TR")}
      </div>
    </div>
  </header>
}
