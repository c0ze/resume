// The artifacts of record and where they live.
//
// Filenames honour the active flavor via Flavor.artifactPrefix (see Flavor.res);
// the vCard is one language- and flavor-independent file. Each artifact is named
// against the script that actually writes it — those paths are real and
// checkable against the repository, which is the point of naming them.
//
// These are plain hrefs, not click handlers: the artifacts table lists the files
// a record was issued as, so it is made of links — they work without
// JavaScript, they can be copied into an ATS, and they are crawlable.

let baseUrl: string = %raw(`import.meta.env.BASE_URL`)

type artifact = {
  format: string,
  file: string,
  generator: string,
}

let artifacts = (language: Translations.language) => {
  let lang = Translations.languageToString(language)
  let prefix = Flavor.artifactPrefix(lang)
  [
    {
      format: "PDF",
      file: `resume-${prefix}${lang}.pdf`,
      generator: "scripts/generate-resume.mjs",
    },
    {
      format: "DOCX",
      file: `resume-${prefix}${lang}.docx`,
      generator: "scripts/generate-docx.mjs",
    },
    {
      format: "JSON",
      file: `resume-${prefix}${lang}.json`,
      generator: "scripts/generate-json-resume.mjs",
    },
    {
      format: "vCard",
      file: "arda.vcf",
      generator: "scripts/generate-vcard.mjs",
    },
  ]
}

let href = file => `${baseUrl}${file}`
