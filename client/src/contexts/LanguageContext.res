type contextValue = {
  language: Translations.language,
  setLanguage: Translations.language => unit,
  translations: Translations.translations,
  // The unflavoured record, so the masthead can strike what a ?flavor= override
  // replaced instead of quietly presenting the amendment as the original.
  base: Translations.translations,
  flavor: option<string>,
}

let context = React.createContext({
  language: Translations.En,
  setLanguage: _ => (),
  translations: Translations.getTranslations(En),
  base: Translations.getTranslations(En),
  flavor: None,
})

module Provider = {
  let make = context->React.Context.provider
}

// Read back whatever the blocking bootstrap in client/index.html already put on
// <html lang>, so the first render agrees with what a screen reader was told.
let storedLanguage: unit => option<string> = %raw(`
  function () {
    try {
      return typeof window !== "undefined"
        ? localStorage.getItem("resume-lang") || undefined
        : undefined;
    } catch (e) {
      return undefined;
    }
  }
`)

// <html lang> must track the selected language: without this, screen readers
// announce Japanese and Turkish content in an English voice. This was a live
// defect — the attribute was hardcoded `en` and never updated.
let applyLanguageToDOM: string => unit = %raw(`
  function (lang) {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    try { localStorage.setItem("resume-lang", lang); } catch (e) {}
  }
`)

@react.component
let make = (~initialLanguage=Translations.En, ~children) => {
  let (language, setLanguage) = React.useState(() =>
    switch storedLanguage() {
    | Some(stored) => Translations.languageFromString(stored)
    | None => initialLanguage
    }
  )

  let flavor = Flavor.currentName()
  let translations = Translations.getTranslations(~flavor=?flavor, language)
  let base = Translations.getTranslations(language)

  React.useEffect(() => {
    applyLanguageToDOM(Translations.languageToString(language))
    None
  }, [language])

  let value = {
    language,
    setLanguage: lang => setLanguage(_ => lang),
    translations,
    base,
    flavor,
  }

  <Provider value> {children} </Provider>
}

let useLanguage = () => React.useContext(context)
