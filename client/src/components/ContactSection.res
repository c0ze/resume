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

  <section id="contact" className="mb-8">
    <h2 className="text-xl font-bold mb-4 text-primary border-b border-border pb-2">
      {React.string(t.contact.title)}
    </h2>
    <UI.Card className="bg-card border-border">
      <UI.CardContent className="p-4 md:p-5">
        <div className="md:flex">
          <div className="md:w-1/2 md:pr-4">
            <h3 className="text-base font-bold mb-3 text-foreground">
              {React.string(t.contact.getInTouch)}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div
                  className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-4">
                  <LucideReact.AtSign className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground"> {React.string("Email")} </p>
                  <button
                    onClick={_ => navigateTo("mailto:" ++ t.header.contactViaEmail)}
                    className="text-primary hover:underline">
                    {React.string(t.contact.emailMe)}
                  </button>
                </div>
              </div>
              <div className="flex items-center">
                <div
                  className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-4">
                  <LucideReact.MapPin className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground"> {React.string("Location")} </p>
                  <p className="text-muted-foreground"> {React.string(t.header.location)} </p>
                </div>
              </div>
              <div className="flex items-center">
                <div
                  className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-4">
                  <LucideReact.Globe className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground"> {React.string("Website")} </p>
                  <a
                    href={if Js.String2.startsWith(t.header.website, "http") {
                      t.header.website
                    } else {
                      "https://" ++ t.header.website
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline">
                    {React.string(t.header.website)}
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 md:mt-0 md:w-1/2 md:pl-4">
            <h3 className="text-base font-bold mb-3 text-foreground">
              {React.string(t.contact.findMeOn)}
            </h3>
            <div className="flex space-x-4">
              {switch t.contact.socialLinks {
              | Some(links) =>
                links
                ->Array.map(link =>
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-primary/20 hover:border-primary/50 transition-colors"
                    ariaLabel={link.name}>
                    {switch link.name {
                    | "LinkedIn" => <LucideReact.Linkedin className="h-6 w-6 text-foreground" />
                    | "GitHub" => <LucideReact.Github className="h-6 w-6 text-foreground" />
                    | name => React.string(name)
                    }}
                  </a>
                )
                ->React.array
              | None => React.null
              }}
            </div>
            <div className="mt-8">
              <p className="font-medium mb-2 text-foreground">
                {React.string(t.header.downloadResume)}
              </p>
              <div className="flex gap-2">
                <UI.Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={_ => handleDownload(language, "pdf")}>
                  <LucideReact.Download className="h-4 w-4 mr-2" />
                  {React.string(
                    switch t.header.downloadPdf {
                    | Some(label) => label
                    | None => "PDF"
                    },
                  )}
                </UI.Button>
                <UI.Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={_ => handleDownload(language, "docx")}>
                  <LucideReact.Download className="h-4 w-4 mr-2" />
                  {React.string(
                    switch t.header.downloadDocx {
                    | Some(label) => label
                    | None => "DOCX"
                    },
                  )}
                </UI.Button>
              </div>
            </div>
          </div>
        </div>
      </UI.CardContent>
    </UI.Card>
  </section>
}
