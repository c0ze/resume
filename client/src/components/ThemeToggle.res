// The four renditions, as data.
//
// `scripts/check-theme-contract.mjs` reads the `name` fields below and checks
// them against the shared arda.tr catalogue, so keep the shape of this list.
// `short` is what the control shows: the group is four buttons wide and the
// full names do not fit on a phone.
type rendition = {
  id: ThemeContext.theme,
  name: string,
  short: string,
}

let renditions = [
  {id: ThemeContext.Light, name: "Light", short: "L"},
  {id: LightHc, name: "Light HC", short: "L+"},
  {id: Dark, name: "Dark", short: "D"},
  {id: DarkHc, name: "Dark HC", short: "D+"},
]

let nameOf = (theme: ThemeContext.theme) =>
  switch renditions->Array.find(r => r.id == theme) {
  | Some(r) => r.name
  | None => "Light"
  }
