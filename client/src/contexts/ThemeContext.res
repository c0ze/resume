// The four renditions of the record book (see DESIGN.md):
//
//   Ruled           — the native sheet: laboratory stock, pale cool green-grey
//   Ruled HC        — the same sheet printed hard, targeting WCAG AAA
//   Carbon Copy     — a carbon flimsy off the same desk, not an inversion
//   Carbon Copy HC  — the flimsy read under a lamp, targeting WCAG AAA
//
// Palette values live in scripts/generate-theme.mjs; the ids here must match
// its `themePalettes` keys, which are also the CSS class names.
type theme = Ruled | RuledHc | CarbonCopy | CarbonCopyHc

let themeToString = theme =>
  switch theme {
  | Ruled => "ruled"
  | RuledHc => "ruled-hc"
  | CarbonCopy => "carbon-copy"
  | CarbonCopyHc => "carbon-copy-hc"
  }

let themeFromString = str =>
  switch str {
  | "ruled-hc" => RuledHc
  | "carbon-copy" => CarbonCopy
  | "carbon-copy-hc" => CarbonCopyHc
  | _ => Ruled
  }

let themes = [Ruled, RuledHc, CarbonCopy, CarbonCopyHc]

let isDark = theme =>
  switch theme {
  | CarbonCopy | CarbonCopyHc => true
  | Ruled | RuledHc => false
  }

// `next` advances from the *current* state rather than from a captured value,
// so two clicks in one tick advance two renditions instead of one.
let next = theme => {
  let index = themes->Array.indexOf(theme)
  themes->Array.get(mod(index + 1, Array.length(themes)))->Option.getOr(Ruled)
}

type contextValue = {
  theme: theme,
  cycleTheme: unit => unit,
}

let context = React.createContext({
  theme: Ruled,
  cycleTheme: () => (),
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
  | None => Ruled
  }
}

let applyThemeToDOM: (string, bool) => unit = %raw(`
  function (themeStr, dark) {
    var root = document.documentElement;
    root.classList.remove("ruled", "ruled-hc", "carbon-copy", "carbon-copy-hc", "dark");
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

  let cycleTheme = () => setThemeState(next)
  let value = {theme, cycleTheme}

  <Provider value> {children} </Provider>
}

let useTheme = () => React.useContext(context)
