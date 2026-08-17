// Build provenance, examinable.
//
// There is no second party in this content and inventing a witness is
// forbidden, so the witness is the build: the commit this page was rendered
// from, the moment it was built, and each artifact attributed to the script
// that generated it. All of it is checkable against a public repository, which
// is the point — the record asks to be verified rather than believed.
//
// It is a dialog because it is genuinely secondary: a reader who wants it is
// deliberately auditing the page, and everyone else should never see it.

@react.component
let make = (~isOpen, ~onClose) => {
  let {translations: t, flavor} = LanguageContext.useLanguage()
  let r = t.record

  <Modal isOpen onClose labelledBy="build-title" closeLabel={r.close}>
    <div className="shrink-0 border-b border-border px-5 py-4">
      <h2 id="build-title" className="t-h3"> {React.string(r.buildDetails)} </h2>
    </div>

    <div className="flex-1 overflow-y-auto px-5 py-4">
      <dl className="grid grid-cols-[6rem_minmax(0,1fr)] gap-x-4 gap-y-2 text-[0.8125rem]">
        <dt className="t-label"> {React.string(r.commit)} </dt>
        <dd className="tabular">
          {switch Build.commitUrl {
          | Some(url) =>
            <a href={url} target="_blank" rel="noopener noreferrer">
              {React.string(Build.commit)}
            </a>
          | None => React.string(Build.commit)
          }}
        </dd>

        <dt className="t-label"> {React.string(r.built)} </dt>
        <dd className="tabular"> {React.string(Build.issuedAtStamp)} </dd>

        <dt className="t-label"> {React.string(r.source)} </dt>
        <dd>
          <a href={Build.repo} target="_blank" rel="noopener noreferrer">
            {React.string(Build.repo->String.replace("https://", ""))}
          </a>
        </dd>

        {switch flavor {
        | Some(name) =>
          <>
            <dt className="t-label"> {React.string(r.amendedFrom)} </dt>
            <dd> {React.string(`?flavor=${name} — ${r.amendmentNote}`)} </dd>
          </>
        | None => React.null
        }}
      </dl>

      <div className="mt-5"> <Downloads /> </div>
    </div>
  </Modal>
}
