// Entry 01 — the Statement, set bilingually side by side.
//
// The reader is often Japanese-speaking and often on a phone; a record that
// makes them switch languages to read the opening claim has already cost them
// time. So the statement is written twice, in parallel columns, on the same
// ruled band.

let endonym = (lang: Translations.language) =>
  switch lang {
  | En => "English"
  | Ja => "日本語"
  | Tr => "Türkçe"
  }

// The companion column: Japanese for an English reader, English for everyone
// else. Both audiences named in the product brief get their own language plus
// the one the other side of the table reads.
let companion = (lang: Translations.language) =>
  switch lang {
  | Translations.En => Translations.Ja
  | Ja | Tr => En
  }

let statement = (t: Translations.translations) => [
  t.about.paragraph1,
  t.about.paragraph2->Option.getOr(""),
]

let column = (lang, t: Translations.translations) => {
  let code = Translations.languageToString(lang)
  <div lang=code>
    <p className="t-label" lang=code> {React.string(endonym(lang))} </p>
    {statement(t)
    ->Array.filter(p => p !== "")
    ->Array.mapWithIndex((p, i) =>
      <p key={Int.toString(i)} className="measure t-body mt-1.5">
        {React.string(p)}
      </p>
    )
    ->React.array}
  </div>
}

@react.component
let make = (~folios: Folio.t) => {
  let {language, translations: t, flavor} = LanguageContext.useLanguage()
  let other = companion(language)
  let otherT = Translations.getTranslations(~flavor=?flavor, other)

  <Entry id="about" number="01" folio={folios.statement} major=true>
    <Entry.Head
      title={t.about.title}
      meta={<span className="t-data pencil">
        {React.string(
          `${Translations.languageToString(language)->String.toUpperCase} / ${Translations.languageToString(
              other,
            )->String.toUpperCase}`,
        )}
      </span>}
    />
    <div className="bilingual">
      {column(language, t)}
      {column(other, otherT)}
    </div>
  </Entry>
}
