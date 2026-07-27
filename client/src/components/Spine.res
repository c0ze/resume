// The binding, visible, holding the record together: a tone-stepped strip down
// the left edge carrying the stitching, the running folio and the running head.
// The 5mm ruling continues through it — the spine is a tone step, not an opaque
// strip laid over the paper it sits on.
//
// Decorative in the accessibility tree: every page number and section name it
// shows is already in the document as real text.

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()
  let folioRef = React.useRef(Nullable.null)
  let headRef = React.useRef(Nullable.null)

  React.useEffect0(() =>
    switch (folioRef.current->Nullable.toOption, headRef.current->Nullable.toOption) {
    | (Some(folio), Some(head)) => Some(Quad.followFolio(folio, head))
    | _ => None
    }
  )

  <aside className="spine" ariaHidden=true>
    <span className="spine__folio">
      {React.string("p.")}
      <b ref={ReactDOM.Ref.domRef(folioRef)}> {React.string("01")} </b>
    </span>
    <span className="spine__head" ref={ReactDOM.Ref.domRef(headRef)} />
    <span className="spine__cap"> {React.string(t.record.volume)} </span>
  </aside>
}
