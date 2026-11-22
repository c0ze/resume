// The build details, examinable.
//
// There is no second party in this content and inventing a witness is
// forbidden, so the witness is the build: the commit the page was rendered
// from, the moment it was issued, and each artifact attributed to the script
// that generated it. All of it is checkable against a public repository.
// Opened from under the name and from the colophon.
//
// An Astryx Dialog, which is a native modal <dialog>: the page behind is
// inert, Escape and the backdrop close it, focus goes to the title and comes
// back to the control that opened it. It is in the prerendered HTML, closed.

@react.component
let make = (~isOpen, ~onClose) => {
  let {translations: t, flavor} = LanguageContext.useLanguage()
  let r = t.record
  let onOpenChange = isOpen =>
    if !isOpen {
      onClose()
    }

  <Astryx.Dialog isOpen onOpenChange width=640>
    <Astryx.DialogHeader
      title={React.string(r.certificate)} subtitle={React.string(r.artifactsOfRecord)} onOpenChange
    />
    <div className="details">
      <dl className="ix-kv">
        <Section.Row label={r.commit}>
          {switch Build.commitUrl {
          | Some(url) => <Section.External href=url> {React.string(Build.commit)} </Section.External>
          | None => React.string(Build.commit)
          }}
        </Section.Row>
        <Section.Row label={r.issued}> {React.string(Build.issuedAtStamp)} </Section.Row>
        <Section.Row label={r.fields.source}>
          <Section.External href={Build.repo} className="url-text">
            {React.string(Build.repo->String.replace("https://", ""))}
          </Section.External>
        </Section.Row>
        {switch flavor {
        | Some(name) =>
          <Section.Row label={`?flavor=`}> {React.string(`${name}: ${r.amendmentNote}`)} </Section.Row>
        | None => React.null
        }}
      </dl>

      <p className="ix-small ix-muted"> {React.string(r.issueNote)} </p>

      <Artifacts />
    </div>
  </Astryx.Dialog>
}
