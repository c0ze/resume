// The document's outline, in one place.
//
// The nav and the sections are two renderings of the same list, so the list
// lives here rather than in either of them. Two hand-maintained copies is how a
// nav ends up pointing at a section that was renamed or removed.
//
// `open` is the arrival state: everything is collapsed except the statement, so
// a reader meets a short index rather than ten viewports of scroll. The counts
// are what keeps that index honest — a closed row that says "9 roles ·
// 2011–2026" reads as a record worth opening; a bare heading reads as an empty
// one.

type entry = {
  id: string,
  label: string,
  hint: string,
  openByDefault: bool,
}

let compute = (t: Translations.translations) => {
  let r = t.record
  let count = n => `${Int.toString(n)} ${r.items}`
  let jobs = t.experience.jobs
  let degrees = t.education.entries

  [
    {id: "about", label: t.about.title, hint: "", openByDefault: true},
    {
      id: "experience",
      label: t.experience.title,
      hint: `${count(Array.length(jobs))} · ${Period.format(jobs->Array.map(j => j.period))}`,
      openByDefault: false,
    },
    {
      id: "skills",
      label: t.skills.title,
      hint: count(Array.length(t.skills.technicalSkills)),
      openByDefault: false,
    },
    {
      id: "projects",
      label: t.projects.title,
      hint: count(Array.length(t.projects.entries)),
      openByDefault: false,
    },
    {
      id: "education",
      label: t.education.title,
      hint: `${count(Array.length(degrees))} · ${Period.format(
          degrees->Array.map(e => e.period),
        )}`,
      openByDefault: false,
    },
    {id: "contact", label: t.contact.title, hint: "", openByDefault: false},
  ]
}

let find = (t, id) => compute(t)->Array.find(e => e.id === id)
