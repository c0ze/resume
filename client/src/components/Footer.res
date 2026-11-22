// The colophon, under the closing rule: how this page was made and the
// build it was issued from. The commit and the timestamp are the witness (see
// Build.res); the build details lay them out in full.

let currentYear: string = %raw(`new Date().getFullYear().toString()`)

@react.component
let make = (~onOpenDetails) => {
  let {translations: t} = LanguageContext.useLanguage()
  let r = t.record

  <footer className="ix-foot colophon">
    <div className="ix-wrap">
      <div className="colophon__in">
        <p> {React.string(t.footer.copyright->String.replaceAll("{year}", currentYear))} </p>
        {switch t.footer.colophon {
        | Some(colophon) =>
          <p>
            {React.string(colophon)}
            <span ariaHidden=true> {React.string(` · `)} </span>
            <a href={Build.repo} target="_blank" rel="noopener noreferrer">
              {React.string(t.footer.source->Option.getOr("source"))}
            </a>
          </p>
        | None => React.null
        }}
        <p>
          {React.string(`${r.commit} `)}
          {switch Build.commitUrl {
          | Some(url) =>
            <a href={url} target="_blank" rel="noopener noreferrer">
              {React.string(Build.commit)}
            </a>
          | None => React.string(Build.commit)
          }}
          <span ariaHidden=true> {React.string(` · `)} </span>
          {React.string(`${r.issued} ${Build.issuedAtStamp}`)}
          <span className="no-print">
            <span ariaHidden=true> {React.string(` · `)} </span>
            <Astryx.Link hasUnderline=true type_=#inherit onClick={_ => onOpenDetails()}>
              {React.string(r.certificate)}
            </Astryx.Link>
          </span>
        </p>
        // The arda.tr family, web-only: hidden in print, and not in
        // contact.socialLinks (that array feeds the JSON Resume profiles).
        <p className="no-print">
          {React.string(`${r.fields.links} `)}
          <a href="https://arda.tr" rel="me"> {React.string("arda.tr")} </a>
          <span ariaHidden=true> {React.string(` · `)} </span>
          <a href="https://blog.arda.tr" rel="me"> {React.string("blog.arda.tr")} </a>
          <span ariaHidden=true> {React.string(` · `)} </span>
          <a href="https://ai.arda.tr"> {React.string("ai.arda.tr")} </a>
          <span ariaHidden=true> {React.string(` · `)} </span>
          <a href="https://lind.arda.tr"> {React.string("lind.arda.tr")} </a>
        </p>
      </div>
    </div>
  </footer>
}
