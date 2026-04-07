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

@react.component
let make = () => {
  let (activeSection, setActiveSection) = React.useState(() => "about")
  let {language, setLanguage, translations: t} = LanguageContext.useLanguage()

  React.useEffect0(() => {
    let handleScroll = () => {
      let current = getActiveSection()
      if current !== "" {
        setActiveSection(_ => current)
      }
    }
    let add: (unit => unit) => unit = %raw(`function(fn) { window.addEventListener("scroll", fn) }`)
    let remove: (unit => unit) => unit = %raw(`function(fn) { window.removeEventListener("scroll", fn) }`)
    add(handleScroll)
    Some(() => remove(handleScroll))
  })

  let sections = [
    ("about", t.navigation.about),
    ("experience", t.navigation.experience),
    ("education", t.navigation.education),
    ("skills", t.navigation.skills),
    ("projects", t.navigation.projects),
    ("contact", t.navigation.contact),
  ]

  let languageOptions = [("en", "EN"), ("ja", "JA"), ("tr", "TR")]

  <nav className="sticky top-0 bg-card/80 backdrop-blur-sm border-b border-border z-10">
    <div className="container mx-auto px-4 md:px-8">
      <div className="flex items-center justify-between gap-2 py-2.5">
        <div className="flex flex-wrap items-center gap-1 min-w-0">
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
              className={"px-2.5 py-1.5 rounded text-sm whitespace-nowrap transition-colors " ++ if (
                activeSection == id
              ) {
                "bg-primary/10 text-primary"
              } else {
                "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }}>
              {React.string(label)}
            </a>
          )
          ->React.array}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={Translations.languageToString(language)}
            onChange={e => {
              let value = ReactEvent.Form.target(e)["value"]
              setLanguage(Translations.languageFromString(value))
            }}
            className="px-2 py-1.5 rounded text-sm border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
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
