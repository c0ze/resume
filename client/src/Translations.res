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
  company: string,
  period: string,
  responsibilities: array<string>,
}

type experienceContent = {
  title: string,
  jobs: array<job>,
}

type additionalInfo = {
  title: string,
  items: array<string>,
}

type educationEntry = {
  degree: string,
  institution: string,
  period: string,
  description: Js.Nullable.t<string>,
  additionalInfo: Js.Nullable.t<additionalInfo>,
}

type educationContent = {
  title: string,
  entries: array<educationEntry>,
}

type skillsContent = {
  title: string,
  technicalSkillsTitle: string,
  technicalSkills: array<string>,
}

type projectEntry = {
  title: string,
  technologies: string,
  description: string,
}

type projectsContent = {
  title: string,
  entries: array<projectEntry>,
}

type socialLink = {
  name: string,
  url: string,
}

type contactContent = {
  title: string,
  getInTouch: string,
  emailMe: string,
  findMeOn: string,
  socialLinks: option<array<socialLink>>,
}

type footerContent = {
  copyright: string,
  backToTop: option<string>,
}

type navigationContent = {
  about: string,
  experience: string,
  education: string,
  skills: string,
  projects: string,
  contact: string,
}

type pdfMetaContent = {
  title: string,
  author: string,
  subject: string,
  keywords: string,
  generatedOn: string,
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

let getTranslations = (language: language): translations => {
  let lang = languageToString(language)
  {
    header: loadSection(lang, "header"),
    about: loadSection(lang, "about"),
    experience: loadSection(lang, "experience"),
    education: loadSection(lang, "education"),
    skills: loadSection(lang, "skills"),
    projects: loadSection(lang, "projects"),
    contact: loadSection(lang, "contact"),
    footer: loadSection(lang, "footer"),
    navigation: loadSection(lang, "navigation"),
    pdfMeta: loadSection(lang, "pdf_meta"),
  }
}
