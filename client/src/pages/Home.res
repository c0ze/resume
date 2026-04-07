@react.component
let make = () => {
  <div className="min-h-screen flex flex-col bg-background text-foreground">
    <Header />
    <Navigation />
    <main className="container mx-auto px-4 md:px-8 py-6">
      <AboutSection />
      <ExperienceSection />
      <EducationSection />
      <SkillsSection />
      <ProjectsSection />
      <ContactSection />
    </main>
    <Footer />
  </div>
}
