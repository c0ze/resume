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
        <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded w-full mb-3"></div>
            ))}
          </CardContent>
        </Card>
      </section>
    );
  }

  const t = translations; // Use translations from context
  const technicalSkillsList: string[] = t.skills.technicalSkills || [];

  return (
    <section id="skills" className="mb-8">
      <h2 className="text-xl font-bold mb-4 text-primary border-b border-border pb-2">{t.skills.title}</h2>

      <Card className="bg-card border-border">
        <CardContent className="p-4 md:p-5">
          {technicalSkillsList.length > 0 ? (
            <ul className="space-y-1.5">
              {technicalSkillsList.map((skill, index) => (
                <li key={index} className="flex items-start gap-2 text-foreground text-base">
                  <span className="text-primary mt-1.5 shrink-0 block w-1.5 h-1.5 rounded-full bg-primary" />
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No skills listed.</p>
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
