// The parts every section of the page is built from.
//
// A section is two columns: its label in capitals at the left (the h2, set as
// the family's `.ix-label`: blackletter is the name's alone), its entries at
// the right, hairlines between them. An entry is a title in Spectral 600 with
// an optional period in mono at the far right, an optional italic line under
// it (the employer, the school, the stack), then the details in small text.
// On a phone the label sits above its entries.

// The anchors the head's section list navigates to, in page order.
let ids = ["about", "experience", "skills", "projects", "education", "contact"]

let navLabel = (n: Translations.navigationContent, id) =>
  switch id {
  | "about" => n.about
  | "experience" => n.experience
  | "skills" => n.skills
  | "projects" => n.projects
  | "education" => n.education
  | _ => n.contact
  }

// "Veltra (Tokyo, Remote)" → "Veltra · Tokyo, Remote". Company strings carry
// their place in brackets in every language; the page sets it as a second
// clause instead.
let splitPlace: string => (string, string) = %raw(`
  function (s) {
    var m = String(s || "").match(/^(.*?)\s*[（(]([^()（）]*)[)）]\s*$/);
    return m ? [m[1], m[2]] : [String(s || ""), ""];
  }
`)

let place = s =>
  switch splitPlace(s) {
  | (name, "") => name
  | (name, where) => `${name} · ${where}`
  }

// "2024 - Present" → "2024 – Present". Periods are free text per language.
let period = s => s->String.replaceAll(" - ", ` – `)

@react.component
let make = (~id, ~title, ~children) =>
  <section id className="sec">
    <h2 className="ix-label" id={`${id}-title`}> {React.string(title)} </h2>
    <div className="sec__body"> {children} </div>
  </section>

// One entry of a section. `label` is a small heading in capitals for an entry
// that has no title of its own (a language, "Profiles").
module Entry = {
  @react.component
  let make = (~title=?, ~label=?, ~labelLang=?, ~meta=?, ~note=?, ~noteLang=?, ~children=?) =>
    <div className="entry">
      {switch (title, meta) {
      | (Some(title), meta) =>
        <div className="entry__head">
          <h3 className="ix-row__title"> {React.string(title)} </h3>
          {switch meta {
          | Some(m) => <p className="ix-mono"> {React.string(m)} </p>
          | None => React.null
          }}
        </div>
      | (None, _) => React.null
      }}
      {switch label {
      | Some(l) => <h3 className="ix-label" lang=?labelLang> {React.string(l)} </h3>
      | None => React.null
      }}
      {switch note {
      | Some(n) => <p className="ix-note ix-small" lang=?noteLang> {React.string(n)} </p>
      | None => React.null
      }}
      {children->Option.getOr(React.null)}
    </div>
}

// One row of a key/value table (brand.css `.ix-kv`): the label, then the
// value. The build details use it.
module Row = {
  @react.component
  let make = (~label, ~children) =>
    <div>
      <dt> {React.string(label)} </dt>
      <dd> {children} </dd>
    </div>
}

// A link that leaves the family: a new tab, so the chat's conversation is
// kept, with Astryx's mark and its "(opens in new tab)" for screen readers.
module External = {
  @react.component
  let make = (~href, ~rel=?, ~className=?, ~children) =>
    <Astryx.Link href ?rel ?className isExternalLink=true hasUnderline=true type_=#inherit>
      {children}
    </Astryx.Link>
}
