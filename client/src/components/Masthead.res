// The first viewport, and the only one a lot of readers will look at.
//
// It has to answer three questions before anything else loads: what is this
// person, is the claim checkable, and where is the file. So: the name, the
// position of record, four facts that carry the span (Tokyo, the residency, the
// count of roles and degrees, the languages), and the four artifacts as real
// links. Nothing is behind an interaction.

let currentYear: int = %raw(`new Date().getFullYear()`)

let normalizeUrl = url => Js.String2.startsWith(url, "http") ? url : "https://" ++ url

@react.component
let make = () => {
  let {language, translations: t, base, flavor} = LanguageContext.useLanguage()
  let r = t.record

  // The one real correction this document can contain. A ?flavor= deep link
  // replaces the position of record; the original is struck and kept beside it.
  // Nothing else is ever struck — an invented amendment would be a lie about
  // the record.
  let amended = switch flavor {
  | Some(_) if base.header.subtitle !== t.header.subtitle => true
  | _ => false
  }

  let residency = r.residentSince->String.replaceAll("{years}", Int.toString(currentYear - 2004))
  let summary =
    r.recordSummary
    ->String.replaceAll("{jobs}", Int.toString(Array.length(t.experience.jobs)))
    ->String.replaceAll("{degrees}", Int.toString(Array.length(t.education.entries)))

  <header id="top" className="masthead">
    <div className="flex justify-end"> <Controls /> </div>

    <h1 className="t-name settle mt-6"> {React.string(t.header.title)} </h1>

    <p className="t-sub settle settle-1 mt-2">
      {amended
        ? <span className="struck" title={r.amendedFrom}>
            {React.string(base.header.subtitle)}
          </span>
        : React.null}
      {React.string(t.header.subtitle)}
    </p>

    <div className="masthead__facts settle settle-2 mt-5">
      <span>
        {React.string(t.header.location)}
        <TokyoClock />
      </span>
      <span> {React.string(residency)} </span>
      <span> {React.string(summary)} </span>
      <span> {React.string(t.about.languagesContent)} </span>
      <span>
        <a href={normalizeUrl(t.header.website)} rel="me">
          {React.string(t.header.website->String.replace("https://", ""))}
        </a>
      </span>
    </div>

    // The four artifacts are peers — the same record in four formats, and which
    // one a reader wants depends entirely on what their system accepts. Filling
    // one of them invented a hierarchy that does not exist. The row is labelled
    // instead, which is what the filled button was really there to say.
    <div className="actions settle settle-3 mt-6 no-print">
      <span className="actions__label t-label"> {React.string(r.download)} </span>
      {Download.artifacts(language)
      ->Array.map(a =>
        <a key={a.format} className="btn" href={Download.href(a.file)} download="">
          {React.string(a.format)}
        </a>
      )
      ->React.array}
    </div>
  </header>
}
