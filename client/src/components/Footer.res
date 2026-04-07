let scrollToTop: unit => unit = %raw(`
  function() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
`)

let currentYear: string = %raw(`new Date().getFullYear().toString()`)

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()

  <footer className="bg-card border-t border-border py-4 px-4 md:px-8 mt-auto">
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="text-sm text-muted-foreground">
          {React.string(String.replaceAll(t.footer.copyright, "{year}", currentYear))}
        </div>
        <button
          onClick={_ => scrollToTop()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          {React.string(
            switch t.footer.backToTop {
            | Some(text) => text
            | None => "Back to top"
            },
          )}
          <LucideReact.ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </div>
  </footer>
}
