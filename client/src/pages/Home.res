@react.component
let make = () => {
  <div className="flex min-h-screen flex-col bg-background text-foreground">
    <Navigation />
    <Header />
    <TechMarquee />
    <main>
      <div className="mx-auto w-full max-w-5xl px-6">
        <AboutSection />
        <ExperienceSection />
        <EducationSection />
        <SkillsSection />
        <ProjectsSection />
        <ContactSection />
      </div>
    </main>
    <Footer />
    <ChatWidget />
  </div>
}
