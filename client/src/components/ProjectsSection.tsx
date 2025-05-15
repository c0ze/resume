import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useLanguage } from "../contexts/LanguageContext";
import { getTranslation } from "../translations";

interface Project {
  title: string;
  description: string;
  technologies: string[];
  image: string;
}

// SVG placeholders as per the requirement to use SVG for vector graphics
const projectSvgs = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" fill="none"><rect width="800" height="450" fill="#f1f5f9"/><path d="M400 225 C 433 185, 467 145, 500 145 C 533 145, 567 185, 600 225 C 567 265, 533 305, 500 305 C 467 305, 433 265, 400 225 Z" fill="#cbd5e1"/><path d="M200 225 C 233 185, 267 145, 300 145 C 333 145, 367 185, 400 225 C 367 265, 333 305, 300 305 C 267 305, 233 265, 200 225 Z" fill="#94a3b8"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" fill="none"><rect width="800" height="450" fill="#f1f5f9"/><circle cx="400" cy="225" r="100" fill="#cbd5e1"/><rect x="280" y="195" width="240" height="60" fill="#94a3b8"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" fill="none"><rect width="800" height="450" fill="#f1f5f9"/><path d="M300 150 L500 150 L500 300 L300 300 Z" fill="#cbd5e1"/><path d="M350 175 L450 175 L450 275 L350 275 Z" fill="#94a3b8"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" fill="none"><rect width="800" height="450" fill="#f1f5f9"/><path d="M200 150 L600 150 L600 300 L200 300 Z" fill="#cbd5e1"/><circle cx="270" cy="200" r="30" fill="#94a3b8"/><circle cx="270" cy="250" r="30" fill="#94a3b8"/><rect x="320" y="180" width="250" height="20" fill="#94a3b8"/><rect x="320" y="230" width="250" height="20" fill="#94a3b8"/></svg>`
];

const ProjectsSection = () => {
  const { language } = useLanguage();
  const t = getTranslation(language);

  // Get project data from translations
  const projects: Project[] = [
    {
      title: t.projects.project1.title,
      description: t.projects.project1.description,
      technologies: t.projects.project1.technologies.split(", "),
      image: projectSvgs[0]
    },
    {
      title: t.projects.project2.title,
      description: t.projects.project2.description,
      technologies: t.projects.project2.technologies.split(", "),
      image: projectSvgs[1]
    },
    {
      title: t.projects.project3.title,
      description: t.projects.project3.description,
      technologies: t.projects.project3.technologies.split(", "),
      image: projectSvgs[2]
    },
    {
      title: t.projects.project4.title,
      description: t.projects.project4.description,
      technologies: t.projects.project4.technologies.split(", "),
      image: projectSvgs[3]
    }
  ];

  return (
    <section id="projects" className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-primary border-b pb-2">{t.projects.title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project, index) => (
          <Card key={index} className="overflow-hidden">
            <AspectRatio ratio={16 / 9} className="bg-gray-200">
              <div 
                dangerouslySetInnerHTML={{ __html: project.image }} 
                className="w-full h-full flex items-center justify-center"
              />
            </AspectRatio>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2">{project.title}</h3>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies.map((tech, idx) => (
                  <span 
                    key={idx} 
                    className="bg-gray-100 rounded-full px-3 py-1 text-xs"
                  >
                    {tech}
                  </span>
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
