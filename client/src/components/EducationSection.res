@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()

  <section id="education" className="mb-8">
    <h2 className="text-xl font-bold mb-4 text-primary border-b border-border pb-2">
      {React.string(t.education.title)}
    </h2>
    <div className="space-y-4">
      {t.education.entries
      ->Array.mapWithIndex((edu, index) =>
        <UI.Card key={Int.toString(index)} className="bg-card border-border">
          <UI.CardContent className="p-4 md:p-5">
            <div className="flex flex-col md:flex-row justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {React.string(edu.degree)}
                </h3>
                <p className="text-primary font-medium text-sm">
                  {React.string(edu.institution)}
                </p>
              </div>
              <div className="mt-1 md:mt-0">
                <span
                  className="inline-block bg-secondary text-muted-foreground rounded-full px-2.5 py-0.5 text-xs font-semibold">
                  {React.string(edu.period)}
                </span>
              </div>
            </div>
            {switch edu.description->Js.Nullable.toOption {
            | Some(desc) if desc !== "" =>
              <p className="text-foreground text-base"> {React.string(desc)} </p>
            | _ => React.null
            }}
            {switch edu.additionalInfo->Js.Nullable.toOption {
            | Some(info) =>
              <div className="mt-2">
                <h4 className="font-semibold text-sm text-foreground">
                  {React.string(info.title)}
                </h4>
                <ul className="list-disc list-inside ml-4 text-foreground text-base">
                  {info.items
                  ->Array.mapWithIndex((item, idx) =>
                    <li key={Int.toString(idx)}> {React.string(item)} </li>
                  )
                  ->React.array}
                </ul>
              </div>
            | None => React.null
            }}
          </UI.CardContent>
        </UI.Card>
      )
      ->React.array}
    </div>
  </section>
}
