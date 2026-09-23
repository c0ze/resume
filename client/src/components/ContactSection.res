// Contact. No address is printed on this page: the email lives only in the
// downloads (repo rule and test assertion). Reaching Arda is the chat, the
// public profiles and the four files in the rail.

let normalizeUrl = url => String.startsWith(url, "http") ? url : "https://" ++ url
let bare = url => url->String.replace("https://", "")->String.replace("www.", "")

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()
  let socials = t.contact.socialLinks->Option.getOr([])

  <Section id="contact" title={t.contact.title}>
    <div className="contact">
      <h3 className="contact__title"> {React.string(t.contact.getInTouch)} </h3>
      <button type_="button" className="btn no-print" onClick={_ => ChatWidget.openChat()}>
        {React.string(t.chat.launcher)}
        <span ariaHidden=true> {React.string(` ▸`)} </span>
      </button>
      <div className="contact__links">
        <p className="contact__label"> {React.string(t.contact.findMeOn)} </p>
        <ul>
          {socials
          ->Array.map(link =>
            <li key={link.name}>
              <a href={link.url} target="_blank" rel="me noopener noreferrer">
                {React.string(bare(link.url)->String.replaceRegExp(%re("/\/$/"), ""))}
              </a>
            </li>
          )
          ->React.array}
          <li>
            <a href={normalizeUrl(t.header.website)} rel="me">
              {React.string(bare(t.header.website))}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </Section>
}
