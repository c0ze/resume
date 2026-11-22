// Contact. No address is printed on this page: the email lives only in the
// downloads (repo rule and test assertion). Reaching Arda is the chat, the
// public profiles and the four files under the name.

let normalizeUrl = url => String.startsWith(url, "http") ? url : "https://" ++ url
let bare = url => url->String.replace("https://", "")->String.replace("www.", "")

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()
  let socials = t.contact.socialLinks->Option.getOr([])

  <Section id="contact" title={t.contact.title}>
    <div className="no-print">
      <Section.Entry label={t.contact.getInTouch}>
        <Astryx.Button label={t.chat.launcher} onClick={_ => ChatWidget.openChat()} />
      </Section.Entry>
    </div>
    <Section.Entry label={t.contact.findMeOn}>
      <ul className="plain contact__links">
        {socials
        ->Array.map(link =>
          <li key={link.name}>
            <Section.External href={link.url} rel="me" className="url-text">
              {React.string(bare(link.url)->String.replaceRegExp(%re("/\/$/"), ""))}
            </Section.External>
          </li>
        )
        ->React.array}
        <li>
          <Astryx.Link
            href={normalizeUrl(t.header.website)}
            rel="me"
            hasUnderline=true
            type_=#inherit
            className="url-text">
            {React.string(bare(t.header.website))}
          </Astryx.Link>
        </li>
      </ul>
    </Section.Entry>
  </Section>
}
