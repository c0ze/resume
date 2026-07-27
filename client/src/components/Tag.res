// The reader's tag: the two controls a bound record can honestly carry — which
// language this copy is written in, and which rendition it is printed on.
//
// Section navigation is the contents index on page 01. A record is found by its
// index, not by a floating pill bar that shadows the document it sits on.

let languages = [
  (Translations.En, "EN"),
  (Translations.Ja, "JA"),
  (Translations.Tr, "TR"),
]

@react.component
let make = () => {
  let {language, setLanguage, translations: t} = LanguageContext.useLanguage()

  <div className="tag no-print">
    <div className="tag__row">
      <span className="tag__key"> {React.string(t.record.language)} </span>
      {languages
      ->Array.map(((lang, label)) =>
        <button
          key=label
          type_="button"
          lang={Translations.languageToString(lang)}
          ariaPressed={language == lang ? #"true" : #"false"}
          onClick={_ => setLanguage(lang)}>
          {React.string(label)}
        </button>
      )
      ->React.array}
    </div>
    <div className="tag__row">
      <span className="tag__key"> {React.string(t.record.rendition)} </span>
      <ThemeToggle />
    </div>
  </div>
}
