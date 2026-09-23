// The one route. The status bar, the treeline, then two columns: the meta rail
// and the main column (name, position, summary, then every section). The chat
// floats over it all. See DESIGN.md.

@react.component
let make = () =>
  <div id="top" className="page">
    <StatusBar />
    <Treeline />
    <div className="cv">
      <Rail />
      <main className="cv__main">
        <Intro />
        <AboutSection />
        <ExperienceSection />
        <SkillsSection />
        <ProjectsSection />
        <EducationSection />
        <ContactSection />
        <Footer />
      </main>
    </div>
    <ChatWidget />
  </div>
