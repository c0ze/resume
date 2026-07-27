// The stamped issue block: what this record was issued as, and by what.
// Used twice — once on the index page, once as the closing entry — because a
// reader who never scrolls past page 01 should still leave with the file.

@react.component
let make = (~title, ~aside, ~children=React.null) =>
  <div className="issue">
    <div className="issue__head">
      {title}
      {aside}
    </div>
    <Artifacts />
    {children}
  </div>
