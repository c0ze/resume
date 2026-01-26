import { Card, CardContent } from "@/components/ui/card";
// AspectRatio and projectSvgs are removed as images are not in the new JSON structure for projects
import { useLanguage } from "../contexts/LanguageContext";
// Removed: import { getTranslation } from "../translations";

interface ProjectEntry { // Renamed for clarity
  title: string;
  description: string;
  technologies: string; // Kept as string, will split for display
  // image?: string; // Image field removed for now
}

const ProjectsSection = () => {
  const { translations, loadingTranslations } = useLanguage();

  if (loadingTranslations || !translations || !translations.projects) {
    // Basic loading state for ProjectsSection
    return (
      <section id="projects" className="mb-12 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="overflow-hidden bg-card border-border">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-full mb-1"></div>
                <div className="h-4 bg-muted rounded w-5/6 mb-4"></div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="h-6 bg-muted rounded-full w-20"></div>
                  <div className="h-6 bg-muted rounded-full w-24"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  const t = translations; // Use translations from context
  const projectEntries: ProjectEntry[] = t.projects.entries || [];

  return (
    <section id="projects" className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-primary border-b border-border pb-2">{t.projects.title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projectEntries.map((project, index) => (
          <Card key={index} className="overflow-hidden flex flex-col bg-card border-border">
            <CardContent className="p-6 flex-grow">
              <h3 className="text-xl font-bold mb-2 text-foreground">{project.title}</h3>
              <p className="text-muted-foreground mb-4 text-sm">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {(project.technologies || "").split(",").map((tech, idx) => (
                  tech.trim() && (
                    <span
                      key={idx}
                      className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium"
                    >
                      {tech.trim()}
                    </span>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default ProjectsSection;
