// The head of the main column: the name, the position and the summary. A
// recruiter who reads only this screen knows what Arda is; the rail beside it
// already holds the files.
//
// A ?flavor= link swaps the position and the summary for that role (the
// overlay is applied in Translations.res); the certificate of issue names the
// flavour, so the page itself stays plain.
//
// The grid keeps the intro out of <main> (see Home.res), so it is a region of
// its own, named by the h1: landmark navigation and "jump to main" would
// otherwise skip the name, the position and the summary.

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()
  let words = t.header.title->String.split(" ")->Array.filter(w => w !== "")

  <section className="intro" ariaLabelledby="intro-name">
    <h1 id="intro-name" className="intro__name">
      {words
      ->Array.mapWithIndex((w, i) =>
        <React.Fragment key={Int.toString(i)}>
          {i == 0 ? React.null : React.string(" ")}
          <span> {React.string(w)} </span>
        </React.Fragment>
      )
      ->React.array}
    </h1>
    <p className="intro__title"> {React.string(t.header.subtitle)} </p>
    <p className="intro__summary"> {React.string(t.about.paragraph1)} </p>
  </section>
}
