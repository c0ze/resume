type themeInfo = {
  id: ThemeContext.theme,
  name: string,
  icon: React.element,
}

let themeInfos = [
  {id: ThemeContext.VanHelsing, name: "Van Helsing", icon: <LucideReact.Moon className="w-4 h-4" />},
  {id: Dracula, name: "Dracula", icon: <LucideReact.Sparkles className="w-4 h-4" />},
  {id: Alucard, name: "Alucard", icon: <LucideReact.Sun className="w-4 h-4" />},
]

@react.component
let make = () => {
  let {theme, setTheme} = ThemeContext.useTheme()

  let cycleTheme = _ => {
    let currentIndex =
      themeInfos->Js.Array2.findIndex(t => t.id == theme)
    let nextIndex = mod(currentIndex + 1, Array.length(themeInfos))
    switch themeInfos->Array.get(nextIndex) {
    | Some(t) => setTheme(t.id)
    | None => ()
    }
  }

  let current = themeInfos->Array.find(t => t.id == theme)
  let (name, icon) = switch current {
  | Some(t) => (t.name, t.icon)
  | None => ("Alucard", <LucideReact.Sun className="w-4 h-4" />)
  }

  <button
    onClick=cycleTheme
    className="theme-toggle flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
    ariaLabel={`Current theme: ${name}. Click to change.`}
    title=name>
    {icon}
  </button>
}
