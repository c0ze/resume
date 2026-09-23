// The one route. The status bar, the treeline, then two columns: the meta rail
// and the main column (name, position, summary, then every section). The chat
// floats over it all. See DESIGN.md.
//
// The intro comes first in the source so that, where the columns stack (≤900px),
// a phone shows the name, the position and the summary before the rail. On a
// wide screen the grid puts the rail back in the left column beside both.

@react.component
let make = () =>
  <div id="top" className="page">
    <StatusBar />
    <Treeline />
    <main className="cv">
      <Intro />
      <Rail />
      <div className="cv__main">
        <AboutSection />
        <ExperienceSection />
        <SkillsSection />
        <ProjectsSection />
        <EducationSection />
        <ContactSection />
        <Footer />
      </div>
    </main>
    <ChatWidget />
  </div>
