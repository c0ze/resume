// The two things a reader of this page can honestly change: the language this
// copy is written in, and the rendition it is rendered on.
//
// Both are stated as pressed/unpressed groups rather than as a cycling button,
// so a reader can see what is available and what is selected without clicking
// to find out. Excluded from print — a printed page has already chosen both.

let languages = [
  (Translations.En, "EN"),
  (Translations.Ja, "JA"),
  (Translations.Tr, "TR"),
]

@react.component
let make = () => {
  let {language, setLanguage, translations: t} = LanguageContext.useLanguage()
  let {theme, setTheme} = ThemeContext.useTheme()

  <div className="controls no-print">
    <div className="controls__group" role="group" ariaLabel={t.record.language}>
      {languages
      ->Array.map(((lang, label)) =>
        <button
          key=label
          type_="button"
          className="btn"
          lang={Translations.languageToString(lang)}
          ariaPressed={language == lang ? #"true" : #"false"}
          onClick={_ => setLanguage(lang)}>
          {React.string(label)}
        </button>
      )
      ->React.array}
    </div>

    <div className="controls__group" role="group" ariaLabel={t.record.rendition}>
      {ThemeToggle.renditions
      ->Array.map(r =>
        <button
          key={ThemeContext.themeToString(r.id)}
          type_="button"
          className="btn"
          ariaPressed={theme == r.id ? #"true" : #"false"}
          ariaLabel={`${t.record.rendition}: ${r.name}`}
          title={`${t.record.rendition}: ${r.name}`}
          onClick={_ => setTheme(r.id)}>
          {React.string(r.short)}
        </button>
      )
      ->React.array}
    </div>
  </div>
}
