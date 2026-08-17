// The colophon: what made this page, from what commit, at what moment.
//
// The provenance sits here rather than in a block of its own because it is the
// last thing a reader needs and the first thing an auditor looks for. The
// commit is a link to the commit; the rest opens the build dialog.

let currentYear: string = %raw(`new Date().getFullYear().toString()`)

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()
  let r = t.record
  let (buildOpen, setBuildOpen) = React.useState(() => false)

  <footer className="colophon">
    <p className="colophon__line">
      {React.string(t.footer.copyright->String.replaceAll("{year}", currentYear))}
    </p>

    <p className="colophon__line">
      <span> {React.string(`${r.built} ${Build.issuedOn}`)} </span>
      <span>
        {React.string(`${r.commit} `)}
        {switch Build.commitUrl {
        | Some(url) =>
          <a href={url} target="_blank" rel="noopener noreferrer">
            {React.string(Build.commit)}
          </a>
        | None => React.string(Build.commit)
        }}
      </span>
      <button
        type_="button" className="colophon__action no-print"
        onClick={_ => setBuildOpen(_ => true)}>
        {React.string(r.buildDetails)}
      </button>
      <a href={Build.repo} target="_blank" rel="noopener noreferrer">
        {React.string(t.footer.source->Option.getOr("source"))}
      </a>
      <a className="no-print" href="#top"> {React.string(r.backToTop)} </a>
    </p>

    <Certificate isOpen=buildOpen onClose={() => setBuildOpen(_ => false)} />
  </footer>
}
