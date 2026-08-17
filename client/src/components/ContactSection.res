// Contact, and the files.
//
// No address is printed on this page: the email lives only in the generated
// downloads (repo rule, and a test asserts it). Reaching Arda is the chat, the
// two public profiles, and the four artifacts.

let normalizeUrl = url => Js.String2.startsWith(url, "http") ? url : "https://" ++ url

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()

  <Section id="contact">
    <div className="stack">
      <div>
        <h3 className="t-h3"> {React.string(t.contact.getInTouch)} </h3>
        <div className="actions mt-3">
          <button
            type_="button" className="btn btn--primary no-print"
            onClick={_ => ChatWidget.openChat()}>
            {React.string(t.chat.launcher)}
          </button>
          {switch t.contact.socialLinks {
          | Some(links) =>
            links
            ->Array.map(link =>
              <a
                key={link.name}
                className="btn"
                href={link.url}
                target="_blank"
                rel="noopener noreferrer">
                {React.string(link.name)}
              </a>
            )
            ->React.array
          | None => React.null
          }}
          <a className="btn" href={normalizeUrl(t.header.website)} rel="me">
            {React.string(t.header.website->String.replace("https://", ""))}
          </a>
        </div>
      </div>

      <div>
        <h3 className="t-h3"> {React.string(t.record.download)} </h3>
        <div className="mt-3"> <Downloads /> </div>
      </div>
    </div>
  </Section>
}
