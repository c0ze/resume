// About. The statement in the page's language, then the whole statement again
// in the companion language (Japanese for an English reader, English for
// everyone else), so a reader on the other side of the table does not have to
// switch languages to read the opening claim. Then the languages Arda speaks.

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

// "Turkish (Native), English (Near Native; TOEFL 263, 2004)" →
// ["Turkish (Native)", "English (Near Native; TOEFL 263, 2004)"]. A comma inside
// the brackets belongs to the certificate, so only top-level commas split.
let spoken: string => array<string> = %raw(`
  function (s) {
    return String(s || "")
      .split(/\s*[,、，]\s*(?![^()（）]*[)）])/)
      .filter(Boolean);
  }
`)

// "English (Near Native; TOEFL 263, 2004)" → ("English (Near Native)", "TOEFL 263, 2004").
// The certificate follows the level after ";" (en, tr) or "／" (ja).
let splitCertificate: string => (string, string) = %raw(`
  function (s) {
    var m = String(s || "").match(/^(.*?)\s*[（(]([^()（）]*?)\s*[;；／]\s*([^()（）]*)[)）]\s*$/);
    return m ? [m[1] + " (" + m[2] + ")", m[3]] : [String(s || ""), ""];
  }
`)

@react.component
let make = () => {
  let {language, translations: t, flavor} = LanguageContext.useLanguage()
  let other = companion(language)
  let otherT = Translations.getTranslations(~flavor?, other)
  let code = Translations.languageToString(other)

  <Section id="about" title={t.about.title}>
    <Section.Entry>
      <div className="entry__prose">
        {paragraphs(t)
        ->Array.mapWithIndex((p, i) => <p key={Int.toString(i)}> {React.string(p)} </p>)
        ->React.array}
      </div>
    </Section.Entry>
    <Section.Entry label={endonym(other)} labelLang=code>
      <div className="entry__prose" lang=code>
        {paragraphs(otherT)
        ->Array.mapWithIndex((p, i) =>
          <p key={Int.toString(i)} className="ix-small ix-muted"> {React.string(p)} </p>
        )
        ->React.array}
      </div>
    </Section.Entry>
    <Section.Entry label={t.record.fields.languages}>
      <ul className="plain">
        {spoken(t.about.languagesContent)
        ->Array.map(l => {
          let (spokenAt, certificate) = splitCertificate(l)
          <li key=l>
            {React.string(Section.place(spokenAt))}
            {certificate == ""
              ? React.null
              : <span className="entry__aside ix-small ix-muted">
                  {React.string(certificate)}
                </span>}
          </li>
        })
        ->React.array}
      </ul>
    </Section.Entry>
  </Section>
}
