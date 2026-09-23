// The rendition switch in the status bar. One button that cycles the four
// renditions — Xerox, Xerox HC, Night, Night HC — and shows the current id.
//
// `scripts/check-theme-contract.mjs` reads the `name` fields below and checks
// them against the shared arda.tr catalogue, so keep the shape of this list.
type themeInfo = {
  id: ThemeContext.theme,
  name: string,
}

let themeInfos = [
  {id: ThemeContext.Xerox, name: "Xerox"},
  {id: XeroxHc, name: "Xerox HC"},
  {id: Night, name: "Night"},
  {id: NightHc, name: "Night HC"},
]

@react.component
let make = () => {
  let {theme, cycleTheme} = ThemeContext.useTheme()
  let {translations: t} = LanguageContext.useLanguage()

  let name = switch themeInfos->Array.find(info => info.id == theme) {
  | Some(info) => info.name
  | None => "Xerox"
  }
  let label = `${t.record.rendition}: ${name}`

  <button type_="button" className="bar__rend" onClick={_ => cycleTheme()} ariaLabel=label title=label>
    {React.string(ThemeContext.themeToString(theme))}
  </button>
}
