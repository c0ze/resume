// The one route: the top line (the emblem, the language switch, the family),
// then the résumé on bone paper in one tight column, the colophon under it,
// and the chat floating over it all. See DESIGN.md.
//
// Landmarks: the top line is the page's <header>, the résumé is <main> (the
// name, the downloads and every section), the colophon its <footer>.
//
// The build details are one dialog, opened from under the name and from
// the colophon; a native modal returns focus to whichever opened it.

@react.component
let make = () => {
  let (detailsOpen, setDetailsOpen) = React.useState(() => false)
  let openDetails = () => setDetailsOpen(_ => true)

  <div id="top" className="page">
    <Bar />
    <main className="ix-wrap">
      <Head onOpenDetails=openDetails />
      <AboutSection />
      <ExperienceSection />
      <SkillsSection />
      <ProjectsSection />
      <EducationSection />
      <ContactSection />
    </main>
    <Footer onOpenDetails=openDetails />
    <Certificate isOpen=detailsOpen onClose={() => setDetailsOpen(_ => false)} />
    <ChatWidget />
  </div>
}
