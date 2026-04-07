type theme = VanHelsing | Dracula | Alucard

let themeToString = theme =>
  switch theme {
  | VanHelsing => "van-helsing"
  | Dracula => "dracula"
  | Alucard => "alucard"
  }

let themeFromString = str =>
  switch str {
  | "van-helsing" => VanHelsing
  | "dracula" => Dracula
  | _ => Alucard
  }

let themes = [VanHelsing, Dracula, Alucard]

let isDark = theme =>
  switch theme {
  | VanHelsing | Dracula => true
  | Alucard => false
  }

type contextValue = {
  theme: theme,
  setTheme: theme => unit,
}

let context = React.createContext({
  theme: Alucard,
  setTheme: _ => (),
})

module Provider = {
  let make = context->React.Context.provider
}

let getStoredTheme = (): theme => {
  let stored: option<string> = %raw(`
    typeof window !== "undefined" ? localStorage.getItem("resume-theme") : null
  `)
  switch stored {
  | Some(s) => themeFromString(s)
  | None => Alucard
  }
}

let applyThemeToDOM: (string, bool) => unit = %raw(`
  function(themeStr, dark) {
    var root = document.documentElement;
    root.classList.remove("van-helsing", "dracula", "alucard", "dark");
    root.classList.add(themeStr);
    if (dark) {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.style.colorScheme = "light";
    }
    localStorage.setItem("resume-theme", themeStr);
  }
`)

@react.component
let make = (~children) => {
  let (theme, setThemeState) = React.useState(() => getStoredTheme())

  React.useEffect(() => {
    applyThemeToDOM(themeToString(theme), isDark(theme))
    None
  }, [theme])

  let setTheme = t => setThemeState(_ => t)
  let value = {theme, setTheme}

  <Provider value> {children} </Provider>
}

let useTheme = () => React.useContext(context)
