import { Card, CardContent } from "@/components/ui/card";
// Progress is removed as levels are not in the new JSON structure
import { useLanguage } from "../contexts/LanguageContext";
// Removed: import { getTranslation } from "../translations";

// Tag interface can be used for displaying skills if needed, or simply map strings
interface Tag {
  name: string;
}

const SkillsSection = () => {
  const { translations, loadingTranslations } = useLanguage();

  if (loadingTranslations || !translations || !translations.skills) {
    // Basic loading state for SkillsSection
    return (
      <section id="skills" className="mb-12 animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
        <Card>
          <CardContent className="p-6">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-300 rounded w-full mb-3"></div>
            ))}
          </CardContent>
        </Card>
      </section>
    );
  }

  const t = translations; // Use translations from context
  const technicalSkillsList: string[] = t.skills.technicalSkills || [];

  return (
    <section id="skills" className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-primary border-b pb-2">{t.skills.title}</h2>
      
      {/* Displaying technical skills in a single card, possibly in columns */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4">{t.skills.technicalSkillsTitle}</h3>
          
          {technicalSkillsList.length > 0 ? (
            <ul className="columns-1 md:columns-2 lg:columns-3 gap-x-6">
              {technicalSkillsList.map((skill, index) => (
                <li key={index} className="mb-2 text-gray-700 dark:text-gray-300 break-inside-avoid">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No skills listed.</p>
          )}
        </CardContent>
      </Card>
      {/* "Other Skills", "Tech Stack", and "Soft Skills" sections are removed
           as this data is now consolidated into the technicalSkills array from skills.json
           or not present in the new resume structure.
      */}
    </section>
  );
};

export default SkillsSection;
