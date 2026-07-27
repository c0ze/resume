// The colophon, printed below the closing rule the way a bound document names
// its own making.

let currentYear: string = %raw(`new Date().getFullYear().toString()`)

@react.component
let make = (~folios: Folio.t) => {
  let {translations: t} = LanguageContext.useLanguage()

  <footer className="entry js-snap">
    <div className="entry__marg">
      <b> {React.string("—")} </b>
      <span className="folio"> {React.string(Folio.ref(folios.total))} </span>
    </div>
    <div className="entry__body">
      <p className="linklist">
        {React.string(t.footer.copyright->String.replaceAll("{year}", currentYear))}
      </p>
      {switch t.footer.colophon {
      | Some(colophon) =>
        <p className="linklist">
          {React.string(colophon)}
          {React.string(`  ·  `)}
          <a href={Build.repo} target="_blank" rel="noopener noreferrer">
            {React.string(t.footer.source->Option.getOr("source"))}
            {React.string(` ↗`)}
          </a>
        </p>
      | None => React.null
      }}
      <p className="linklist no-print">
        <a href="#top"> {React.string(t.record.backToIndex)} </a>
      </p>
    </div>
  </footer>
}
