// The four renditions of the résumé — the shared One Bit Forest ids (see
// DESIGN.md and ../DESIGN-SYSTEM.md):
//
//   Xerox      — light, the default: paper, black toner, moss signal
//   Xerox HC   — high-contrast light, targeting WCAG AAA
//   Night      — dark
//   Night HC   — high-contrast dark, targeting WCAG AAA
//
// Palette values live in scripts/generate-theme.mjs; the ids here must match
// its `themePalettes` keys, which are also the CSS class names. The blocking
// bootstrap in client/index.html migrates legacy stored ids by role before
// first paint; `themeFromString` repeats that mapping so React agrees with it.
type theme = Xerox | XeroxHc | Night | NightHc

let themeToString = theme =>
  switch theme {
  | Xerox => "xerox"
  | XeroxHc => "xerox-hc"
  | Night => "night"
  | NightHc => "night-hc"
  }

// Legacy ids migrate by role: light → xerox, HC light → xerox-hc,
// dark → night, HC dark → night-hc. Unknown values fall back to the default.
let themeFromString = str =>
  switch str {
  | "xerox-hc" | "ruled-hc" | "paper" | "light-hc" => XeroxHc
  | "night" | "carbon-copy" | "van-helsing" | "dracula" | "dark" => Night
  | "night-hc" | "carbon-copy-hc" | "carbon" | "dark-hc" => NightHc
  | _ => Xerox
  }

let themes = [Xerox, XeroxHc, Night, NightHc]

let isDark = theme =>
  switch theme {
  | Night | NightHc => true
  | Xerox | XeroxHc => false
  }

// `next` advances from the *current* state rather than from a captured value,
// so two clicks in one tick advance two renditions instead of one.
let next = theme => {
  let index = themes->Array.indexOf(theme)
  themes->Array.get(mod(index + 1, Array.length(themes)))->Option.getOr(Xerox)
}

type contextValue = {
  theme: theme,
  cycleTheme: unit => unit,
}

let context = React.createContext({
  theme: Xerox,
  cycleTheme: () => (),
})

module Provider = {
  let make = context->React.Context.provider
}

// Read back whatever the blocking bootstrap in client/index.html already
// applied, so React's first render agrees with the already-painted page.
let getStoredTheme = (): theme => {
  let stored: option<string> = %raw(`
    (function () {
      try {
        return typeof window !== "undefined" ? localStorage.getItem("resume-theme") || undefined : undefined;
      } catch (e) {
        return undefined;
      }
    })()
  `)
  switch stored {
  | Some(s) => themeFromString(s)
  | None => Xerox
  }
}

let applyThemeToDOM: (string, bool) => unit = %raw(`
  function (themeStr, dark) {
    var root = document.documentElement;
    root.classList.remove("xerox", "xerox-hc", "night", "night-hc", "dark");
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
