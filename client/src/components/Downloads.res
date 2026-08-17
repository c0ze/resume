// The four artifacts, each attributed to the script that actually generated it.
//
// These are plain links, not click handlers: they work without JavaScript, they
// can be copied into an ATS, and they are crawlable. Naming the generator is
// the closest this record comes to a countersign — every path is real and
// checkable against the public repository.

@react.component
let make = () => {
  let {language, translations: t} = LanguageContext.useLanguage()

  <div>
    <div className="files">
      {Download.artifacts(language)
      ->Array.map(a =>
        <a key={a.format} className="file" href={Download.href(a.file)} download="">
          <span className="file__name"> {React.string(a.file)} </span>
          <span className="file__meta">
            {React.string(`${a.format} · ${t.record.generatedBy} ${a.generator}`)}
          </span>
        </a>
      )
      ->React.array}
    </div>
    <p className="t-meta measure mt-3"> {React.string(t.record.downloadNote)} </p>
  </div>
}
