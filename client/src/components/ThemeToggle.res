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
    className="flex items-center justify-center w-9 h-9 rounded-full bg-secondary border border-border text-muted-foreground hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-all"
    ariaLabel={`Current theme: ${name}. Click to change.`}
    title=name>
    {icon}
  </button>
}
