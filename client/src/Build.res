// Machine provenance — the countersign of this record.
//
// There is no second party in this content and inventing a witness is
// forbidden, so the witness is the build: the commit the page was rendered
// from and the moment it was issued. The artifacts each attribute themselves to
// the script that actually generated them — see Download.res.
//
// `__BUILD_COMMIT__` / `__BUILD_TIME__` are substituted by Vite `define`
// (config/vite.config.ts). The guards keep this module usable outside a Vite
// build — the ReScript type checker, a bare `node` import — where the globals
// do not exist.

let commit: string = %raw(`
  typeof __BUILD_COMMIT__ !== "undefined" ? __BUILD_COMMIT__ : "unversioned"
`)

let issuedAt: string = %raw(`
  typeof __BUILD_TIME__ !== "undefined" ? __BUILD_TIME__ : ""
`)

// ISO-8601 date of issue, e.g. "2026-07-27". Falls back to the empty string
// rather than to "today", so a missing stamp reads as missing, not as invented.
let issuedOn = issuedAt->String.slice(~start=0, ~end=10)

// "2026-07-27 14:02 UTC" — the full timestamp, tabular and checkable.
let issuedAtStamp = {
  let date = issuedOn
  let time = issuedAt->String.slice(~start=11, ~end=16)
  date === "" ? "—" : `${date} ${time} UTC`
}

let repo = "https://github.com/c0ze/resume"

// A commit you can open is a countersign you can verify.
let commitUrl = commit === "unversioned" ? None : Some(`${repo}/commit/${commit}`)
