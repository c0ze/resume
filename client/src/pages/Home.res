// One route, one document, in the order a hiring decision actually reads it:
// who this is, what they say about themselves, what they have done, what they
// know, what they built, where they trained, and how to reach them.
//
// The masthead sits above the split so the name, the facts and the four
// artifacts get the full width; below it the page is navigation in the rail and
// the document beside it.

@react.component
let make = () => {
  <>
    <main className="doc">
      <Masthead />
      <div className="body">
        <Nav />
        <div>
          <AboutSection />
          <ExperienceSection />
          <SkillsSection />
          <ProjectsSection />
          <EducationSection />
          <ContactSection />
        </div>
      </div>
      <Footer />
    </main>
    <ChatWidget />
  </>
}
