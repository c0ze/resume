module Card = {
  @react.component
  let make = (~className="", ~children) => {
    <div className={"rounded-lg border bg-card text-card-foreground shadow-sm " ++ className}>
      {children}
    </div>
  }
}

module CardContent = {
  @react.component
  let make = (~className="", ~children) => {
    <div className={"p-6 pt-0 " ++ className}> {children} </div>
  }
}

module Button = {
  @react.component
  let make = (~className="", ~onClick=?, ~children) => {
    <button
      type_="button"
      className={"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 " ++
      className}
      ?onClick>
      {children}
    </button>
  }
}
