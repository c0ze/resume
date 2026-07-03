// Shared résumé-download helpers, used by both Header and ContactSection so the
// filename logic lives in one place. Download filenames honor the active flavor
// via Flavor.artifactPrefix (see Flavor.res); the vCard is flavor-independent.

let baseUrl: string = %raw(`import.meta.env.BASE_URL`)

let openUrl: string => unit = %raw(`function(url) { window.open(url, '_blank') }`)

let handleDownload = (language, ext) => {
  let lang = Translations.languageToString(language)
  let fileName = `resume-${Flavor.artifactPrefix(lang)}${lang}.${ext}`
  let fullPath = `${baseUrl}${fileName}?t=${Int.toString(Date.now()->Float.toInt)}`
  openUrl(fullPath)
}

// The vCard is a single, language- and flavor-independent artifact.
let handleVcardDownload = () => {
  let fullPath = `${baseUrl}arda.vcf?t=${Int.toString(Date.now()->Float.toInt)}`
  openUrl(fullPath)
}
