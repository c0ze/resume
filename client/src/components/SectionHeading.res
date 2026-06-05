// Monospace "datasheet" section header: an index number + hairline + title,
// with an optional description. Used across every section for rhythm.
@react.component
let make = (~index, ~title, ~description=?) => {
  <div className="mb-8 flex flex-col gap-3">
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs font-medium tracking-[0.3em] text-primary">
        {React.string(index)}
      </span>
      <span className="h-px w-10 bg-border" />
    </div>
    <h2 className="font-display text-[1.7rem] font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
      {React.string(title)}
    </h2>
    {switch description {
    | Some(d) =>
      <p className="max-w-2xl leading-relaxed text-muted-foreground"> {React.string(d)} </p>
    | None => React.null
    }}
  </div>
}
