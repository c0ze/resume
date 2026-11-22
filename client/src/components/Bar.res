// The top of the page: the emblem at the left, once (it signs the page, a
// stamped seal on bone paper, and links to arda.tr); at the right the language
// switch as one segmented control and small links to the family's other sites.
// On paper only the emblem is printed.

// A verbatim copy of arda.tr's brand/art/emblem.webp: bone lines on a
// transparent ground. `.ix-emblem` (brand.css) gives it its round soot ground.
@module("../brand/art/emblem.webp") external emblem: string = "default"

// The switch names each language in that language.
let languages = [(Translations.En, "EN"), (Translations.Ja, `日本語`), (Translations.Tr, "TR")]

// The family's sites. English words on every page, so the nav is marked
// lang="en".
let family = [
  ("arda.tr", "https://arda.tr"),
  ("blog", "https://blog.arda.tr"),
  ("ask", "https://ai.arda.tr"),
]

@react.component
let make = () => {
  let {language, setLanguage, translations: t} = LanguageContext.useLanguage()

  <header className="top">
    <div className="ix-wrap top__in">
      <a className="top__seal" href="https://arda.tr" rel="me">
        <img className="ix-emblem" src=emblem alt="arda.tr" width="56" height="56" />
      </a>
      <div className="top__end no-print">
        // One control: the cells are the family's chips, joined; the current
        // language is the filled one.
        <div className="lang" role="group" ariaLabel={t.record.language}>
          {languages
          ->Array.map(((lang, label)) =>
            <button
              key=label
              type_="button"
              className="ix-chip"
              lang={Translations.languageToString(lang)}
              ariaCurrent=?{language == lang ? Some(#"true") : None}
              onClick={_ => setLanguage(lang)}>
              {React.string(label)}
            </button>
          )
          ->React.array}
        </div>
        <nav className="links ix-small" ariaLabel="arda.tr" lang="en">
          {family
          ->Array.map(((label, href)) => <a key=label href> {React.string(label)} </a>)
          ->React.array}
        </nav>
      </div>
    </div>
  </header>
}
