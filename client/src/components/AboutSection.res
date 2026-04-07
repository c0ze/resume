@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()

  <section id="about" className="mb-8">
    <h2 className="text-xl font-bold mb-4 text-primary border-b border-border pb-2">
      {React.string(t.about.title)}
    </h2>
    <div className="md:flex">
      <div className="md:w-3/4 pr-0 md:pr-6">
        <p className="mb-3 text-foreground leading-relaxed">
          {React.string(t.about.paragraph1)}
        </p>
        {switch t.about.paragraph2 {
        | Some(p2) =>
          <p className="text-foreground leading-relaxed"> {React.string(p2)} </p>
        | None => React.null
        }}
      </div>
      <div className="mt-4 md:mt-0 md:w-1/4 md:pl-0 lg:pl-6">
        <UI.Card className="p-4 bg-secondary border-border">
          <h3 className="font-semibold text-base mb-2 text-foreground">
            {React.string(t.about.languages)}
          </h3>
          <p className="text-sm text-muted-foreground">
            {React.string(t.about.languagesContent)}
          </p>
        </UI.Card>
      </div>
    </div>
  </section>
}
