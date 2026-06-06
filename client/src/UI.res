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

// Institution / company logo tile. Shows the logo on a light tile when a file is
// provided (logos live in public/images/logos/), otherwise falls back to the
// given icon on a primary-tinted tile. `tile` supplies size + rounding classes.
module Logo = {
  let assetBase: string = %raw(`import.meta.env.BASE_URL`)

  @react.component
  let make = (~logo: option<string>, ~tile, ~fallback) =>
    switch logo {
    | Some(src) =>
      <span
        className={"flex shrink-0 items-center justify-center overflow-hidden border border-border bg-white p-1.5 " ++
        tile}>
        <img
          src={`${assetBase}images/logos/${src}`}
          alt=""
          ariaHidden=true
          loading={#"lazy"}
          className="h-full w-full object-contain"
        />
      </span>
    | None =>
      <span
        className={"flex shrink-0 items-center justify-center bg-primary/10 text-primary " ++ tile}>
        {fallback}
      </span>
    }
}
