// The head of the page: the name, the position, where Arda is, the four
// files, and the sections of the page.
//
// The name is the page's only h1 and the only blackletter on it (the theme
// sets h1 in Grenze Gotisch 800; index.css keeps it so on the Japanese page). A ?flavor= link swaps the position for that
// role (the overlay is applied in Translations.res); the build details name
// the flavour.
//
// The downloads are plain <a download> links: they work without JavaScript,
// can be copied into an ATS, and are crawlable. Filenames honour ?flavor= via
// Download.artifacts. The PDF is the page's one primary button (bone on soot);
// the others are the theme's secondary, a 1px outline.

let currentYear: int = %raw(`new Date().getFullYear()`)

@react.component
let make = (~onOpenDetails) => {
  let {language, translations: t} = LanguageContext.useLanguage()
  let r = t.record

  let residency = r.residentSince->String.replaceAll("{years}", Int.toString(currentYear - 2004))

  let label = (a: Download.artifact) => {
    let fromContent = switch a.format {
    | "PDF" => t.header.downloadPdf
    | "DOCX" => t.header.downloadDocx
    | "JSON" => t.header.downloadJson
    | _ => t.header.downloadVcard
    }
    fromContent->Option.getOr(a.format)
  }
  let get = t.header.downloadResume

  <header className="head">
    <h1 id="name"> {React.string(t.header.title)} </h1>
    <p className="head__title"> {React.string(t.header.subtitle)} </p>
    <p className="ix-small ix-muted">
      {React.string(t.header.location)}
      <span ariaHidden=true> {React.string(` · `)} </span>
      {React.string(residency)}
    </p>
    <div className="head__get no-print" role="group" ariaLabel=get>
      {Download.artifacts(language)
      ->Array.map(a =>
        <Astryx.Button
          key={a.format}
          label={a.format == "PDF" ? `${get} (${label(a)})` : label(a)}
          variant={a.format == "PDF" ? #primary : #secondary}
          href={Download.href(a.file)}
          download=""
        />
      )
      ->React.array}
    </div>
    <p className="ix-small ix-muted no-print">
      {React.string(`${r.issued} ${Build.issuedOn}`)}
      <span ariaHidden=true> {React.string(` · `)} </span>
      <Astryx.Link hasUnderline=true type_=#inherit onClick={_ => onOpenDetails()}>
        {React.string(r.certificate)}
      </Astryx.Link>
    </p>
    <nav className="links ix-small head__nav no-print" ariaLabel={r.sections}>
      {Section.ids
      ->Array.map(id =>
        <a key=id href={`#${id}`}> {React.string(Section.navLabel(t.navigation, id))} </a>
      )
      ->React.array}
    </nav>
  </header>
}
