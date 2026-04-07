let baseUrl: string = %raw(`import.meta.env.BASE_URL`)

let openUrl: string => unit = %raw(`function(url) { window.open(url, '_blank') }`)
let navigateTo: string => unit = %raw(`function(url) { window.location.href = url }`)

let handleDownload = (language, ext) => {
  let lang = Translations.languageToString(language)
  let fileName = `resume-${lang}.${ext}`
  let fullPath = `${baseUrl}${fileName}?t=${Int.toString(Date.now()->Float.toInt)}`
  openUrl(fullPath)
}

@react.component
let make = () => {
  let {language, translations: t} = LanguageContext.useLanguage()

  <header className="bg-card border-b border-border py-5 px-4 md:px-8">
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            {React.string(t.header.title)}
          </h1>
          <p className="text-base text-muted-foreground">
            {React.string(t.header.subtitle)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <button
            onClick={_ => navigateTo("mailto:" ++ t.header.contactViaEmail)}
            className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <LucideReact.AtSign className="h-3.5 w-3.5" />
            {React.string(t.header.contactViaEmail)}
          </button>
          <span className="flex items-center gap-1.5">
            <LucideReact.MapPin className="h-3.5 w-3.5" />
            {React.string(t.header.location)}
          </span>
          <a
            href={if Js.String2.startsWith(t.header.website, "http") {
              t.header.website
            } else {
              "https://" ++ t.header.website
            }}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <LucideReact.Globe className="h-3.5 w-3.5" />
            {React.string(t.header.website)}
          </a>
          <span className="flex items-center gap-1.5">
            <LucideReact.Download className="h-3.5 w-3.5" />
            <button
              type_="button"
              onClick={_ => handleDownload(language, "pdf")}
              className="bg-primary text-primary-foreground font-medium py-1 px-2.5 rounded text-sm hover:opacity-90 transition-opacity">
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
              className="bg-primary text-primary-foreground font-medium py-1 px-2.5 rounded text-sm hover:opacity-90 transition-opacity">
              {React.string(
                switch t.header.downloadDocx {
                | Some(label) => label
                | None => "DOCX"
                },
              )}
            </button>
          </span>
        </div>
      </div>
    </div>
  </header>
}
