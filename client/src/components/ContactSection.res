// Entry 06 — Countersign & Issue, the closing entry.
//
// No address is printed on this record: the email lives only in the downloads
// (repo rule and test assertion). Reaching Arda is the chat, the two public
// profiles, and the four files.

let normalizeUrl = url => Js.String2.startsWith(url, "http") ? url : "https://" ++ url

@react.component
let make = (~folios: Folio.t) => {
  let {translations: t} = LanguageContext.useLanguage()
  let r = t.record
  let (certOpen, setCertOpen) = React.useState(() => false)

  <Entry id="contact" number="06" folio={folios.issue} major=true>
    <Entry.Head
      title={t.contact.title}
      meta={<span className="stamp"> {React.string(r.closingEntry)} </span>}
    />

    <p className="measure t-body my-q"> {React.string(r.issueNote)} </p>

    <IssueBlock
      title={<span className="t-label"> {React.string(r.artifactsOfRecord)} </span>}
      aside={<span className="t-data pencil"> {React.string("EN · JA · TR")} </span>}>
      <div className="countersign">
        <div>
          <div className="sigline"> {React.string(t.header.title)} </div>
          <div className="sigcap"> {React.string(r.authorOfRecord)} </div>
        </div>
        <div className="countersign__date">
          <div className="sigline sigline--red t-data"> {React.string(Build.issuedOn)} </div>
          <div className="sigcap"> {React.string(r.dateOfIssue)} </div>
        </div>
      </div>

      <p className="linklist px-q pt-q">
        <span className="t-label"> {React.string(r.commit)} </span>
        {React.string(" ")}
        {switch Build.commitUrl {
        | Some(url) =>
          <a href={url} target="_blank" rel="noopener noreferrer">
            {React.string(Build.commit)}
          </a>
        | None => React.string(Build.commit)
        }}
        {React.string(`  ·  `)}
        <span className="t-label"> {React.string(r.issued)} </span>
        {React.string(` ${Build.issuedAtStamp}`)}
        {React.string(`  ·  `)}
        <button type_="button" className="stamp" onClick={_ => setCertOpen(_ => true)}>
          {React.string(r.certificate)}
        </button>
      </p>
    </IssueBlock>

    <div className="mt-q2">
      <div className="entry__head entry__head--light">
        <h3 className="t-entry"> {React.string(t.contact.getInTouch)} </h3>
        <span className="t-data pencil"> {React.string(t.contact.findMeOn)} </span>
      </div>

      <p className="linklist">
        <button type_="button" className="slip" onClick={_ => ChatWidget.openChat()}>
          {React.string(t.chat.launcher)}
        </button>
      </p>

      <p className="linklist">
        {switch t.contact.socialLinks {
        | Some(links) =>
          links
          ->Array.mapWithIndex((link, i) =>
            <React.Fragment key={link.name}>
              {i === 0 ? React.null : React.string(`  ·  `)}
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {React.string(link.url->String.replace("https://", ""))}
              </a>
            </React.Fragment>
          )
          ->React.array
        | None => React.null
        }}
        {React.string(`  ·  `)}
        <a href={normalizeUrl(t.header.website)} rel="me">
          {React.string(t.header.website->String.replace("https://", ""))}
        </a>
      </p>
    </div>

    <Certificate isOpen=certOpen onClose={() => setCertOpen(_ => false)} />
  </Entry>
}
