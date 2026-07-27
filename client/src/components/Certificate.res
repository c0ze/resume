// The countersign, examinable.
//
// There is no second party in this content and inventing a witness is
// forbidden, so the witness is the build: the commit the page was rendered
// from, the moment it was issued, and each artifact attributed to the script
// that generated it. All of it is checkable against a public repository, which
// is the whole point — the record asks to be verified, not believed.

@react.component
let make = (~isOpen, ~onClose) => {
  let {translations: t, flavor} = LanguageContext.useLanguage()
  let r = t.record

  <Modal isOpen onClose labelledBy="certificate-title" closeLabel={t.experience.close}>
    <div className="shrink-0 border-b border-ink bg-stock-deep px-q py-q">
      <p className="t-label"> {React.string(r.artifactsOfRecord)} </p>
      <h2 id="certificate-title" className="t-section"> {React.string(r.certificate)} </h2>
    </div>

    <div className="flex-1 overflow-y-auto px-q py-q">
      <Entry.Fields
        rows={Array.concat(
          [
            Entry.Fields.node(
              r.commit,
              switch Build.commitUrl {
              | Some(url) =>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {React.string(Build.commit)}
                  {React.string(` ↗`)}
                </a>
              | None => React.string(Build.commit)
              },
            ),
            Entry.Fields.text(r.issued, Build.issuedAtStamp),
            Entry.Fields.node(
              r.fields.source,
              <a href={Build.repo} target="_blank" rel="noopener noreferrer">
                {React.string(Build.repo->String.replace("https://", ""))}
                {React.string(` ↗`)}
              </a>,
            ),
          ],
          switch flavor {
          | Some(name) => [Entry.Fields.prose(`?flavor=`, `${name} — ${r.amendmentNote}`)]
          | None => []
          },
        )}
      />

      <p className="measure t-body mt-q"> {React.string(r.issueNote)} </p>

      <div className="mt-q"> <Artifacts /> </div>
    </div>
  </Modal>
}
