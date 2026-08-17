// The four renditions (see DESIGN.md):
//
//   Light      — the native rendition, read under office light and printed
//   Light HC   — the same page harder, targeting WCAG AAA
//   Dark       — read at night, or by anyone whose whole desktop is dark
//   Dark HC    — the dark page harder, targeting WCAG AAA
//
// Palette values live in scripts/generate-theme.mjs; the ids here must match
// its `themePalettes` keys, which are also the CSS class names.
//
// `Dark` deliberately uses the id `dark`, which is also the class Tailwind's
// `dark:` variant keys off — one class doing both jobs. `DarkHc` therefore
// carries *both* `dark-hc` and `dark`, and generate-theme.mjs emits `.dark-hc`
// after `.dark` so it wins at equal specificity.
type theme = Light | LightHc | Dark | DarkHc

let themeToString = theme =>
  switch theme {
  | Light => "light"
  | LightHc => "light-hc"
  | Dark => "dark"
  | DarkHc => "dark-hc"
  }

let themeFromString = str =>
  switch str {
  | "light-hc" => LightHc
  | "dark" => Dark
  | "dark-hc" => DarkHc
  | _ => Light
  }

let themes = [Light, LightHc, Dark, DarkHc]

let isDark = theme =>
  switch theme {
  | Dark | DarkHc => true
  | Light | LightHc => false
  }

// `next` advances from the *current* state rather than from a captured value,
// so two clicks in one tick advance two renditions instead of one.
let next = theme => {
  let index = themes->Array.indexOf(theme)
  themes->Array.get(mod(index + 1, Array.length(themes)))->Option.getOr(Light)
}

type contextValue = {
  theme: theme,
  cycleTheme: unit => unit,
  setTheme: theme => unit,
}

let context = React.createContext({
  theme: Light,
  cycleTheme: () => (),
  setTheme: _ => (),
})

module Provider = {
  let make = context->React.Context.provider
}

// Read back whatever the blocking bootstrap in client/index.html already
// applied, so React's first render agrees with the already-painted page.
let getStoredTheme = (): theme => {
  let stored: option<string> = %raw(`
    typeof window !== "undefined" ? localStorage.getItem("resume-theme") : null
  `)
  switch stored {
  | Some(s) => themeFromString(s)
  | None => Light
  }
}

let applyThemeToDOM: (string, bool) => unit = %raw(`
  function (themeStr, dark) {
    var root = document.documentElement;
    root.classList.remove("light", "light-hc", "dark", "dark-hc");
    root.classList.add(themeStr);
    if (dark) {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.style.colorScheme = "light";
    }
    try { localStorage.setItem("resume-theme", themeStr); } catch (e) {}
  }
`)

@react.component
let make = (~children) => {
  let (theme, setThemeState) = React.useState(() => getStoredTheme())

  React.useEffect(() => {
    applyThemeToDOM(themeToString(theme), isDark(theme))
    None
  }, [theme])

  let value = {
    theme,
    cycleTheme: () => setThemeState(next),
    setTheme: t => setThemeState(_ => t),
  }

  <Provider value> {children} </Provider>
}

let useTheme = () => React.useContext(context)
