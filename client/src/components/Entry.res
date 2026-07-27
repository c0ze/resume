// The apparatus of a bound record: a numbered, dated entry sitting in a ruled
// margin, its header rule, and the ruled field table underneath it.
//
// An entry is *closed* by its own rule and the next one begins with its header
// directly — doubling both produces two rules and a gap.

// The numbered header of an entry. `sub` sets a sub-entry (a role, a degree):
// lighter rule, Mincho title, one level down in the outline.
module Head = {
  @react.component
  let make = (~title, ~gloss=?, ~glossLang=?, ~meta=?, ~sub=false) => {
    let glossNode = switch gloss {
    | Some(g) if g !== "" =>
      <span className="pencil" lang=?glossLang> {React.string(` ${g}`)} </span>
    | _ => React.null
    }
    let metaNode = switch meta {
    | Some(m) => m
    | None => React.null
    }

    <div className={sub ? "entry__head entry__head--light" : "entry__head"}>
      {sub
        ? <h3 className="t-entry"> <span className="js-head"> {React.string(title)} </span> {glossNode} </h3>
        : <h2 className="t-section"> <span className="js-head"> {React.string(title)} </span> {glossNode} </h2>}
      {metaNode}
    </div>
  }
}

// A ruled field table: a fixed label column and a fluid value column, every row
// exactly two quads tall so each form rule lands on a paper rule. Labels are one
// word — the column is 7rem and "POSITION OF RECORD" wraps to three lines.
module Fields = {
  type row = {
    label: string,
    value: React.element,
    prose: bool,
  }

  let text = (label, value) => {label, value: React.string(value), prose: false}
  let prose = (label, value) => {label, value: React.string(value), prose: true}
  let node = (label, value) => {label, value, prose: false}

  @react.component
  let make = (~rows: array<row>, ~labelLang=?) =>
    Array.length(rows) === 0
      ? React.null
      : <div className="fields">
          <dl>
            {rows
            ->Array.mapWithIndex((row, i) =>
              <React.Fragment key={Int.toString(i)}>
                <dt lang=?labelLang> {React.string(row.label)} </dt>
                <dd className={row.prose ? "is-prose" : ""}> {row.value} </dd>
              </React.Fragment>
            )
            ->React.array}
          </dl>
        </div>
}

let assetBase: string = %raw(`import.meta.env.BASE_URL`)

@react.component
let make = (~id=?, ~number, ~folio, ~major=false, ~logo=?, ~children) => {
  let mark = switch logo {
  | Some(Some(file)) =>
    <span className="entry__mark" ariaHidden=true>
      <img src={`${assetBase}images/logos/${file}`} alt="" loading={#"lazy"} />
    </span>
  | _ => React.null
  }

  <section id=?id className={"entry js-page js-snap" ++ (major ? " entry--major" : "")}>
    <div className="entry__marg">
      <b> {React.string(number)} </b>
      <span className="folio js-folio"> {React.string(Folio.ref(folio))} </span>
      {mark}
    </div>
    <div className="entry__body"> {children} </div>
  </section>
}
