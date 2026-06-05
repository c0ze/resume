let scrollToTop: unit => unit = %raw(`
  function() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
`)

let currentYear: string = %raw(`new Date().getFullYear().toString()`)

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()

  <footer className="mt-auto border-t border-border py-8">
    <div className="mx-auto w-full max-w-5xl px-6">
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-primary" ariaHidden=true />
          <span>
            {React.string("arda")}
            <span className="text-primary"> {React.string(".tr")} </span>
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          {React.string(String.replaceAll(t.footer.copyright, "{year}", currentYear))}
        </div>
        <button
          onClick={_ => scrollToTop()}
          className="no-print flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
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
