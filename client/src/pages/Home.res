// The one route. The status bar, the treeline, then two columns: the meta rail
// and the main column (name, position, summary, then every section). The chat
// floats over it all. See DESIGN.md.
//
// The intro comes first in the source so that, where the columns stack (≤900px),
// a phone shows the name, the position and the summary before the rail. On a
// wide screen the grid puts the rail back in the left column beside both.
//
// Landmarks: the grid lives on a plain wrapper, so the rail <aside> and the
// colophon <footer> are top-level (complementary, contentinfo) rather than
// nested in <main>, which holds the sections. <main> is an unstyled block
// inside .cv__main, so the layout is unchanged. The intro sits in its own grid
// cell, outside <main>, so it is a region labelled by the h1 (Intro.res).

@react.component
let make = () =>
  <div id="top" className="page">
    <StatusBar />
    <Treeline />
    <div className="cv">
      <Intro />
      <Rail />
      <div className="cv__main">
        <main>
          <AboutSection />
          <ExperienceSection />
          <SkillsSection />
          <ProjectsSection />
          <EducationSection />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </div>
    <ChatWidget />
  </div>
