type themeInfo = {
  id: ThemeContext.theme,
  name: string,
  icon: React.element,
}

/* Curated professional subset of the shared catalogue (see DESIGN-SYSTEM.md):
   Ivory (light) · Paper (HC light) · Steel (dark) · Carbon (HC dark). */
let themeInfos = [
  {id: ThemeContext.Alucard, name: "Ivory", icon: <LucideReact.Sun className="w-4 h-4" />},
  {id: Paper, name: "Paper (high contrast)", icon: <LucideReact.Contrast className="w-4 h-4" />},
  {id: VanHelsing, name: "Steel", icon: <LucideReact.Moon className="w-4 h-4" />},
  {id: Carbon, name: "Carbon (high contrast)", icon: <LucideReact.Contrast className="w-4 h-4" />},
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
  | None => ("Ivory", <LucideReact.Sun className="w-4 h-4" />)
  }

  <button
    onClick=cycleTheme
    className="theme-toggle flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
    ariaLabel={`Current theme: ${name}. Click to change.`}
    title=name>
    {icon}
  </button>
}
