// Entry 00.1 — the issue block, on the index page.
//
// The action is exposed on the first screen: a recruiter who reads only page 01
// knows what Arda is and already has the file.

@react.component
let make = (~folios: Folio.t) => {
  let {translations: t} = LanguageContext.useLanguage()
  let r = t.record
  let (certOpen, setCertOpen) = React.useState(() => false)

  <Entry number="00.1" folio={folios.index}>
    <IssueBlock
      title={<h2 className="t-section"> {React.string(r.issue)} </h2>}
      aside={<button
        type_="button"
        className="stamp stamp--double"
        onClick={_ => setCertOpen(_ => true)}
        title={r.certificate}>
        {React.string(`${r.issued} ${Build.issuedOn}`)}
      </button>}
    />
    <Certificate isOpen=certOpen onClose={() => setCertOpen(_ => false)} />
  </Entry>
}
