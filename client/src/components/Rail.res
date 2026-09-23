// The meta rail: the left column of the page, mono-labelled. Where Arda is,
// what he speaks, where else to find him, the four files, and the chat.
//
// The downloads are plain <a download> links — they work without JavaScript,
// can be copied into an ATS, and are crawlable. Filenames honour ?flavor= via
// Download.artifacts. Where the columns stack (≤900px) the rail follows the
// intro, so a phone shows the name and position first and the files next.

let currentYear: int = %raw(`new Date().getFullYear()`)

let normalizeUrl = url => String.startsWith(url, "http") ? url : "https://" ++ url
let host = url =>
  url->String.replace("https://", "")->String.replace("http://", "")->String.replace("www.", "")

// "Turkish (Native), English (Near Native)" → ["Turkish · Native", …]
let spoken: string => array<string> = %raw(`
  function (s) {
    return String(s || "").split(/\s*[,、，]\s*/).filter(Boolean);
  }
`)

module Group = {
  @react.component
  let make = (~label, ~className="", ~children) =>
    <div className={"rail__group " ++ className}>
      <dt> {React.string(label)} </dt>
      <dd> {children} </dd>
    </div>
}

@react.component
let make = () => {
  let {language, translations: t} = LanguageContext.useLanguage()
  let r = t.record
  let (certOpen, setCertOpen) = React.useState(() => false)

  let residency = r.residentSince->String.replaceAll("{years}", Int.toString(currentYear - 2004))
  let socials = t.contact.socialLinks->Option.getOr([])

  let label = (a: Download.artifact) => {
    let fromContent = switch a.format {
    | "PDF" => t.header.downloadPdf
    | "DOCX" => t.header.downloadDocx
    | "JSON" => t.header.downloadJson
    | _ => t.header.downloadVcard
    }
    fromContent->Option.getOr(a.format)
  }

  <aside className="rail" ariaLabel={t.header.title}>
    <dl>
      <Group label={r.fields.location}>
        <p> {React.string(t.header.location)} </p>
        <p className="rail__muted"> {React.string(residency)} </p>
      </Group>

      <Group label={r.fields.languages}>
        {spoken(t.about.languagesContent)
        ->Array.map(l => <p key=l> {React.string(Section.place(l))} </p>)
        ->React.array}
      </Group>

      <Group label={r.fields.links}>
        <p className="rail__links">
          <a href={normalizeUrl(t.header.website)} rel="me">
            {React.string(host(t.header.website))}
          </a>
          {socials
          ->Array.map(link =>
            <React.Fragment key={link.name}>
              <span className="rail__sep" ariaHidden=true> {React.string(` · `)} </span>
              <a href={link.url} target="_blank" rel="me noopener noreferrer">
                {React.string(link.name)}
              </a>
            </React.Fragment>
          )
          ->React.array}
        </p>
      </Group>

      <Group label={r.fields.download} className="rail__dl no-print">
        <ul className="dl">
          {Download.artifacts(language)
          ->Array.map(a =>
            <li key={a.format}>
              <a href={Download.href(a.file)} download="" title={a.file}>
                <span> {React.string(label(a))} </span>
                <span ariaHidden=true> {React.string(`↓`)} </span>
              </a>
            </li>
          )
          ->React.array}
        </ul>
        <p className="rail__issue">
          <span> {React.string(`${r.issued} ${Build.issuedOn}`)} </span>
          <button type_="button" className="linkish" onClick={_ => setCertOpen(_ => true)}>
            {React.string(r.certificate)}
          </button>
        </p>
      </Group>

      <Group label={r.fields.ask} className="no-print">
        <button type_="button" className="linkish" onClick={_ => ChatWidget.openChat()}>
          {React.string(t.chat.launcher)}
          <span ariaHidden=true> {React.string(` ▸`)} </span>
        </button>
      </Group>
    </dl>
    <Certificate isOpen=certOpen onClose={() => setCertOpen(_ => false)} />
  </aside>
}
