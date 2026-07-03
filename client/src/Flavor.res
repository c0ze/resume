// Role-targeted résumé flavors (SP2). The base résumé (ai-platform) has no
// overlay; flavors live in content/flavors/*.json and are applied via a
// ?flavor=<name> query param for targeted-send deep links. A flavor overrides
// only the summary (header subtitle + About paragraphs) for the languages it
// ships (`exportLangs`); everything else stays the shared base content.
// See docs/superpowers/specs for the design.

type aboutOverride = {
  paragraph1: option<string>,
  paragraph2: option<string>,
}

type override = {
  subtitle: option<string>,
  about: option<aboutOverride>,
}

type t = {
  name: string,
  exportLangs: array<string>,
  overrides: Dict.t<override>,
}

let files: Dict.t<JSON.t> = %raw(`
  import.meta.glob('../../content/flavors/*.json', { eager: true, import: 'default' })
`)

let get = (name: string): option<t> =>
  files->Dict.get(`../../content/flavors/${name}.json`)->Option.map(json => Obj.magic(json))

// The ?flavor= query param — browser only; None during SSR/prerender (no window),
// so the static homepage always renders the base résumé.
let currentName: unit => option<string> = %raw(`
  function () {
    try {
      var name = new URLSearchParams(window.location.search).get('flavor');
      return name ? name : undefined;
    } catch (_) {
      return undefined;
    }
  }
`)

// Download filename prefix: "<flavor>-" when the active flavor ships this
// language, "" otherwise (fall back to the base artifact).
let artifactPrefix = (language: string): string =>
  switch currentName() {
  | Some(name) =>
    switch get(name) {
    | Some(flavor) if flavor.exportLangs->Array.includes(language) => `${flavor.name}-`
    | _ => ""
    }
  | None => ""
  }
