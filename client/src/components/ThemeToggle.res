// The rendition cycler. Four renditions of the same record: the native sheet,
// the same sheet printed hard, a carbon flimsy, and the flimsy under a lamp.
//
// `scripts/check-theme-contract.mjs` reads the `name` fields below and checks
// them against the shared arda.tr catalogue, so keep the shape of this list.
type themeInfo = {
  id: ThemeContext.theme,
  name: string,
}

let themeInfos = [
  {id: ThemeContext.Ruled, name: "Ruled"},
  {id: RuledHc, name: "Ruled HC"},
  {id: CarbonCopy, name: "Carbon Copy"},
  {id: CarbonCopyHc, name: "Carbon Copy HC"},
]

@react.component
let make = () => {
  let {theme, cycleTheme} = ThemeContext.useTheme()
  let {translations: t} = LanguageContext.useLanguage()

  let cycle = _ => cycleTheme()

  let name = switch themeInfos->Array.find(info => info.id == theme) {
  | Some(info) => info.name
  | None => "Ruled"
  }

  <button
    type_="button"
    onClick=cycle
    ariaLabel={`${t.record.rendition}: ${name}`}
    title={`${t.record.rendition}: ${name}`}>
    {React.string(name)}
  </button>
}
