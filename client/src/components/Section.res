// The parts every section of the main column is built from.
//
// A section opens with a mono label and a 1px rule running to the edge; its
// entries are two-column rows — a mono gutter (period, index) on the left, the
// entry on the right — closed by a hairline. No cards, no chips for anything
// that is not a list of names, no ornament.

// The anchors the status bar navigates to, in page order.
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

let pad = i => i < 9 ? `0${Int.toString(i + 1)}` : Int.toString(i + 1)

@react.component
let make = (~id, ~title, ~children) =>
  <section id className="sec" ariaLabelledby={`${id}-title`}>
    <h2 id={`${id}-title`} className="sec__head"> {React.string(title)} </h2>
    {children}
  </section>

module Row = {
  @react.component
  let make = (~gutter, ~children, ~gutterLang=?) =>
    <div className="row">
      <p className="row__gutter" lang=?gutterLang> {gutter} </p>
      <div className="row__body"> {children} </div>
    </div>
}
