let scrollToSection: string => unit = %raw(`
  function(sectionId) {
    var section = document.getElementById(sectionId);
    var nav = document.querySelector("nav");
    var navHeight = nav ? nav.offsetHeight : 0;
    if (section) {
      var sectionTop = section.offsetTop - navHeight;
      window.scrollTo({ top: sectionTop, behavior: "smooth" });
    }
  }
`)

let getActiveSection: unit => string = %raw(`
  function() {
    var sections = document.querySelectorAll("section[id]");
    var nav = document.querySelector("nav");
    var navHeight = nav ? nav.offsetHeight : 0;
    var current = "";
    sections.forEach(function(section) {
      var sectionTop = section.offsetTop - navHeight - 10;
      var sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute("id") || "";
      }
    });
    return current;
  }
`)

let isScrolled: unit => bool = %raw(`function() { return window.scrollY > 12; }`)

let addScrollListener: (unit => unit) => unit = %raw(`function(fn) { window.addEventListener("scroll", fn, { passive: true }) }`)
let removeScrollListener: (unit => unit) => unit = %raw(`function(fn) { window.removeEventListener("scroll", fn) }`)

@react.component
let make = () => {
  let (activeSection, setActiveSection) = React.useState(() => "about")
  let (scrolled, setScrolled) = React.useState(() => false)
  let {language, setLanguage, translations: t} = LanguageContext.useLanguage()

  React.useEffect0(() => {
    let handleScroll = () => {
      let current = getActiveSection()
      if current !== "" {
        setActiveSection(_ => current)
      }
      setScrolled(_ => isScrolled())
    }
    handleScroll()
    addScrollListener(handleScroll)
    Some(() => removeScrollListener(handleScroll))
  })

  let sections = [
    ("about", t.navigation.about),
    ("experience", t.navigation.experience),
    ("skills", t.navigation.skills),
    ("projects", t.navigation.projects),
    ("education", t.navigation.education),
    ("contact", t.navigation.contact),
  ]

  let languageOptions = [("en", "EN"), ("ja", "JA"), ("tr", "TR")]

  <nav
    className={"sticky top-0 z-40 border-b transition-all duration-300 " ++ (
      scrolled
        ? "glass border-border shadow-soft"
        : "border-transparent bg-background/50 backdrop-blur-sm"
    )}>
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
      <div className="flex items-center justify-between gap-2 py-2.5">
        <div className="flex min-w-0 flex-wrap items-center gap-1">
          {sections
          ->Array.map(((id, label)) =>
            <a
              key=id
              href={"#" ++ id}
              onClick={e => {
                ReactEvent.Mouse.preventDefault(e)
                scrollToSection(id)
                setActiveSection(_ => id)
              }}
              className={"whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors " ++ (
                activeSection == id
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}>
              {React.string(label)}
            </a>
          )
          ->React.array}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <select
            value={Translations.languageToString(language)}
            onChange={e => {
              let value = ReactEvent.Form.target(e)["value"]
              setLanguage(Translations.languageFromString(value))
            }}
            className="rounded-full border border-border bg-card px-2.5 py-1.5 font-mono text-xs text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40">
            {languageOptions
            ->Array.map(((value, label)) =>
              <option key=value value> {React.string(label)} </option>
            )
            ->React.array}
          </select>
          <ThemeToggle />
        </div>
      </div>
    </div>
  </nav>
}
