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
        <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => ( // Skeleton for 2 project cards
            <Card key={i} className="overflow-hidden">
              {/* Removed AspectRatio and image placeholder */}
              <CardContent className="p-6">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6 mb-4"></div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="h-6 bg-gray-300 rounded-full w-20"></div>
                  <div className="h-6 bg-gray-300 rounded-full w-24"></div>
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
      <h2 className="text-2xl font-bold mb-6 text-primary border-b pb-2">{t.projects.title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projectEntries.map((project, index) => (
          <Card key={index} className="overflow-hidden flex flex-col"> {/* Added flex flex-col for better content structure */}
            {/* Image/AspectRatio removed */}
            <CardContent className="p-6 flex-grow"> {/* Added flex-grow */}
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">{project.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {(project.technologies || "").split(",").map((tech, idx) => (
                  tech.trim() && ( // Ensure not to render empty tags
                    <span
                      key={idx}
                      className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full px-3 py-1 text-xs font-medium"
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
