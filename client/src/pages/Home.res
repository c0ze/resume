// The bound record, in order: the index page, then the entries, then the
// countersign. One route, one document.

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()
  let folios = Folio.compute(t)

  // The ruling is the layout grid, so it has to be re-measured whenever the
  // page's measurements change — a new language, a new flavour, a resize, or
  // the web fonts finally arriving.
  React.useEffect1(() => Some(Quad.align()), [
    Array.length(t.experience.jobs),
    Array.length(t.skills.technicalSkills),
    String.length(t.header.subtitle),
  ])

  <div className="sheet">
    <Spine />
    <main className="page">
      <Masthead folios />
      <Contents folios />
      <IndexIssue folios />
      <AboutSection folios />
      <ExperienceSection folios />
      <SkillsSection folios />
      <ProjectsSection folios />
      <EducationSection folios />
      <ContactSection folios />
      <Footer folios />
    </main>
    <Tag />
    <ChatWidget />
  </div>
}
