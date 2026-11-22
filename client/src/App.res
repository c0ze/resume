// The one page inside the family's Astryx theme, light only (see DESIGN.md),
// with Astryx's own strings ("Close", "(opens in new tab)") in the page's
// language. English ships with the components; the Japanese and Turkish
// catalogs load as their own chunks the first time they are needed, and until
// one arrives (or if it never does) those strings stay English.

let localeTag = (language: Translations.language) =>
  switch language {
  | En => "en"
  | Ja => "ja-JP"
  | Tr => "tr-TR"
  }

let loadCatalog: string => promise<option<Astryx.I18n.catalog>> = %raw(`
  function (tag) {
    var pick = function (m) { return m.default; };
    if (tag === "ja-JP") return import("@astryxdesign/core/locales/ja-JP.generated.js").then(pick);
    if (tag === "tr-TR") return import("@astryxdesign/core/locales/tr-TR.generated.js").then(pick);
    return Promise.resolve(undefined);
  }
`)

@react.component
let make = () => {
  let {language} = LanguageContext.useLanguage()
  let locale = localeTag(language)
  let (messages, setMessages) = React.useState((): Astryx.I18n.messages => Dict.make())

  React.useEffect1(() => {
    loadCatalog(locale)
    ->Promise.thenResolve(catalog =>
      switch catalog {
      | Some(c) => setMessages(prev => Dict.fromArray(Array.concat(Dict.toArray(prev), [(locale, c)])))
      | None => ()
      }
    )
    ->Promise.catch(_ => Promise.resolve())
    ->ignore
    None
  }, [locale])

  <Astryx.Theme theme=Astryx.Theme.arda mode=#light>
    <Astryx.I18n locale messages>
      <Home />
    </Astryx.I18n>
  </Astryx.Theme>
}
