type contextValue = {
  language: Translations.language,
  setLanguage: Translations.language => unit,
  translations: Translations.translations,
}

let context = React.createContext({
  language: Translations.En,
  setLanguage: _ => (),
  translations: Translations.getTranslations(En),
})

module Provider = {
  let make = context->React.Context.provider
}

@react.component
let make = (~initialLanguage=Translations.En, ~children) => {
  let (language, setLanguage) = React.useState(() => initialLanguage)
  let translations = Translations.getTranslations(language)

  let value = {
    language,
    setLanguage: lang => setLanguage(_ => lang),
    translations,
  }

  <Provider value> {children} </Provider>
}

let useLanguage = () => React.useContext(context)
