type language = En | Ja | Tr

let languageToString = lang =>
  switch lang {
  | En => "en"
  | Ja => "ja"
  | Tr => "tr"
  }

let languageFromString = str =>
  switch str {
  | "ja" => Ja
  | "tr" => Tr
  | _ => En
  }

type headerContent = {
  title: string,
  subtitle: string,
  contactViaEmail: string,
  location: string,
  website: string,
  downloadResume: string,
  downloadPdf: option<string>,
  downloadDocx: option<string>,
  downloadJson: option<string>,
  downloadVcard: option<string>,
}

type aboutContent = {
  title: string,
  paragraph1: string,
  paragraph2: option<string>,
  languages: string,
  languagesContent: string,
}

type job = {
  title: string,
  abstract: option<string>,
  logo: option<string>,
  company: string,
  period: string,
  responsibilities: array<string>,
}

type experienceContent = {
  title: string,
  viewDetails: string,
  close: string,
  jobs: array<job>,
}

type additionalInfo = {
  title: string,
  items: array<string>,
}

type educationLink = {
  label: string,
  url: string,
}

type educationEntry = {
  degree: string,
  institution: string,
  period: string,
  logo: option<string>,
  description: Js.Nullable.t<string>,
  links: option<array<educationLink>>,
  additionalInfo: Js.Nullable.t<additionalInfo>,
}

type educationContent = {
  title: string,
  entries: array<educationEntry>,
}

type skillsContent = {
  title: string,
  technicalSkills: array<string>,
}

type projectEntry = {
  title: string,
  technologies: string,
  description: string,
  repo: Js.Nullable.t<string>,
}

type projectsContent = {
  title: string,
  viewSource: string,
  entries: array<projectEntry>,
}

type socialLink = {
  name: string,
  url: string,
}

type contactContent = {
  title: string,
  getInTouch: string,
  findMeOn: string,
  socialLinks: option<array<socialLink>>,
}

type footerContent = {
  copyright: string,
  backToTop: option<string>,
  colophon: option<string>,
  source: option<string>,
}

type navigationContent = {
  about: string,
  experience: string,
  education: string,
  skills: string,
  projects: string,
  contact: string,
}

type chatContent = {
  launcher: string,
  title: string,
  greeting: string,
  placeholder: string,
  send: string,
  close: string,
  thinking: string,
  error: string,
  suggestions: array<string>,
}

type pdfMetaContent = {
  title: string,
  author: string,
  subject: string,
  keywords: string,
  generatedOn: string,
}

// The record book's own vocabulary — field labels, column heads, the issue and
// countersign copy. Kept out of the résumé sections proper because none of it
// is a claim about Arda; it is the apparatus of the document. Translated in
// full for all three languages: Japanese and Turkish are not fallbacks.
type recordFields = {
  location: string,
  resident: string,
  languages: string,
  record: string,
  site: string,
  organisation: string,
  period: string,
  engagement: string,
  abstract: string,
  evidence: string,
  institution: string,
  stack: string,
  source: string,
}

type recordColumns = {
  no: string,
  period: string,
  organisation: string,
  title: string,
  page: string,
  format: string,
  file: string,
  generatedBy: string,
  issued: string,
}

type recordContent = {
  book: string,
  volume: string,
  contents: string,
  entriesLabel: string,
  pagesLabel: string,
  issue: string,
  artifactsOfRecord: string,
  issued: string,
  closingEntry: string,
  certificate: string,
  authorOfRecord: string,
  dateOfIssue: string,
  commit: string,
  issueNote: string,
  amendmentNote: string,
  register: string,
  registerNote: string,
  residentSince: string,
  recordSummary: string,
  rendition: string,
  language: string,
  backToIndex: string,
  fields: recordFields,
  columns: recordColumns,
}

type translations = {
  header: headerContent,
  about: aboutContent,
  experience: experienceContent,
  education: educationContent,
  skills: skillsContent,
  projects: projectsContent,
  contact: contactContent,
  footer: footerContent,
  navigation: navigationContent,
  chat: chatContent,
  record: recordContent,
  @as("pdf_meta") pdfMeta: pdfMetaContent,
}

let allContent: Dict.t<JSON.t> = %raw(`
  import.meta.glob('../../content/**/*.json', { eager: true, import: 'default' })
`)

let loadSection = (lang: string, section: string): 'a => {
  let key = `../../content/${lang}/${section}.json`
  switch allContent->Dict.get(key) {
  | Some(v) => Obj.magic(v)
  | None => panic(`Missing content file: ${key}`)
  }
}

// Overlay a flavor's per-language summary (subtitle + About) onto the base
// translations. Applies only for languages the flavor ships; otherwise the base
// is returned unchanged, so switching to a non-shipped language shows the base.
let applyFlavor = (base: translations, name: string, lang: string): translations =>
  switch Flavor.get(name) {
  | Some(flavor) if flavor.exportLangs->Array.includes(lang) =>
    switch flavor.overrides->Dict.get(lang) {
    | Some(ov) =>
      let header = switch ov.subtitle {
      | Some(subtitle) => {...base.header, subtitle}
      | None => base.header
      }
      let about = switch ov.about {
      | Some(a) => {
          ...base.about,
          paragraph1: a.paragraph1->Option.getOr(base.about.paragraph1),
          paragraph2: switch a.paragraph2 {
          | Some(p) => Some(p)
          | None => base.about.paragraph2
          },
        }
      | None => base.about
      }
      {...base, header, about}
    | None => base
    }
  | _ => base
  }

let getTranslations = (~flavor=?, language: language): translations => {
  let lang = languageToString(language)
  let base = {
    header: loadSection(lang, "header"),
    about: loadSection(lang, "about"),
    experience: loadSection(lang, "experience"),
    education: loadSection(lang, "education"),
    skills: loadSection(lang, "skills"),
    projects: loadSection(lang, "projects"),
    contact: loadSection(lang, "contact"),
    footer: loadSection(lang, "footer"),
    navigation: loadSection(lang, "navigation"),
    chat: loadSection(lang, "chat"),
    record: loadSection(lang, "record"),
    pdfMeta: loadSection(lang, "pdf_meta"),
  }
  switch flavor {
  | Some(name) => applyFlavor(base, name, lang)
  | None => base
  }
}
