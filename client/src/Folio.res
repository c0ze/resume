// Page numbering for the bound record.
//
// A notebook's pages are sequential and its index cites them, so the folios
// have to be real numbers rather than decoration. They are derived purely from
// the shape of the content — how many engagements, how many degrees — which
// makes them identical in all three languages and stable across builds.
//
// An entry header shares a page with its first sub-entry, exactly as a bound
// document does.

let pad = n => n < 10 ? `0${Int.toString(n)}` : Int.toString(n)

// "p. 03"
let ref = n => `p. ${pad(n)}`

type t = {
  index: int,
  statement: int,
  service: int,
  job: int => int,
  skills: int,
  works: int,
  education: int,
  degree: int => int,
  issue: int,
  total: int,
}

let compute = (t: Translations.translations) => {
  let jobs = Array.length(t.experience.jobs)
  let degrees = Array.length(t.education.entries)

  let index = 1
  let statement = 2
  let service = 3
  let skills = service + (jobs > 0 ? jobs : 1)
  let works = skills + 1
  let education = works + 1
  let issue = education + (degrees > 0 ? degrees : 1)

  {
    index,
    statement,
    service,
    job: i => service + i,
    skills,
    works,
    education,
    degree: i => education + i,
    issue,
    total: issue,
  }
}
