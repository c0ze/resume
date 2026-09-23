// The certificate of issue, examinable.
//
// There is no second party in this content and inventing a witness is
// forbidden, so the witness is the build: the commit the page was rendered
// from, the moment it was issued, and each artifact attributed to the script
// that generated it. All of it is checkable against a public repository.
// Opened from the rail and from the colophon; an accessible dialog (Modal.res).

@react.component
let make = (~isOpen, ~onClose) => {
  let {translations: t, flavor} = LanguageContext.useLanguage()
  let r = t.record

  let field = (label, value) =>
    <div key=label className="cert__row">
      <dt> {React.string(label)} </dt>
      <dd> {value} </dd>
    </div>

  <Modal isOpen onClose labelledBy="certificate-title" closeLabel={t.experience.close}>
    <div className="dialog__head">
      <p className="dialog__kicker"> {React.string(r.artifactsOfRecord)} </p>
      <h2 id="certificate-title" className="dialog__title"> {React.string(r.certificate)} </h2>
    </div>

    <div className="dialog__body">
      <dl className="cert">
        {field(
          r.commit,
          switch Build.commitUrl {
          | Some(url) =>
            <a href={url} target="_blank" rel="noopener noreferrer">
              {React.string(Build.commit)}
              {React.string(` ↗`)}
            </a>
          | None => React.string(Build.commit)
          },
        )}
        {field(r.issued, React.string(Build.issuedAtStamp))}
        {field(
          r.fields.source,
          <a href={Build.repo} target="_blank" rel="noopener noreferrer">
            {React.string(Build.repo->String.replace("https://", ""))}
            {React.string(` ↗`)}
          </a>,
        )}
        {switch flavor {
        | Some(name) => field(`?flavor=`, React.string(`${name}: ${r.amendmentNote}`))
        | None => React.null
        }}
      </dl>

      <p className="dialog__note"> {React.string(r.issueNote)} </p>

      <Artifacts />
    </div>
  </Modal>
}
