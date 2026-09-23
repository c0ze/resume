// About. The first paragraph is the summary under the name (Intro.res); this
// section carries the rest of the statement, then the whole statement again in
// the companion language — Japanese for an English reader, English for
// everyone else — so a reader on the other side of the table does not have to
// switch languages to read the opening claim.

let endonym = (lang: Translations.language) =>
  switch lang {
  | En => "English"
  | Ja => `日本語`
  | Tr => `Türkçe`
  }

let companion = (lang: Translations.language) =>
  switch lang {
  | Translations.En => Translations.Ja
  | Ja | Tr => En
  }

let paragraphs = (t: Translations.translations) =>
  [t.about.paragraph1, t.about.paragraph2->Option.getOr("")]->Array.filter(p => p !== "")

@react.component
let make = () => {
  let {language, translations: t, flavor} = LanguageContext.useLanguage()
  let other = companion(language)
  let otherT = Translations.getTranslations(~flavor?, other)
  let code = Translations.languageToString(other)

  <Section id="about" title={t.about.title}>
    {switch t.about.paragraph2 {
    | Some(p) if p !== "" =>
      <Section.Row gutter={React.string(endonym(language))}>
        <p className="row__prose"> {React.string(p)} </p>
      </Section.Row>
    | _ => React.null
    }}
    <Section.Row gutter={React.string(endonym(other))} gutterLang=code>
      <div className="row__prose row__prose--companion" lang=code>
        {paragraphs(otherT)
        ->Array.mapWithIndex((p, i) => <p key={Int.toString(i)}> {React.string(p)} </p>)
        ->React.array}
      </div>
    </Section.Row>
  </Section>
}
