// The statement. Two paragraphs, in the language the reader selected.
//
// The previous design set this bilingually, side by side. That is a real cost
// on a phone — two half-width columns of prose — and the language control above
// already serves a Japanese or Turkish reader properly, so the statement is
// written once, in their language, at full measure.

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()

  let paragraphs =
    [t.about.paragraph1, t.about.paragraph2->Option.getOr("")]->Array.filter(p => p !== "")

  <Section id="about">
    <div className="measure">
      {paragraphs
      ->Array.mapWithIndex((p, i) =>
        <p key={Int.toString(i)} className={i === 0 ? "t-body" : "t-body mt-4"}>
          {React.string(p)}
        </p>
      )
      ->React.array}
    </div>
  </Section>
}
