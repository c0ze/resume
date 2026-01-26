import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "../contexts/LanguageContext";
// Removed: import { getTranslation } from "../translations";

// Interface can remain the same as it matches the structure within the entries array
interface AdditionalInfo {
  title: string;
  items: string[];
}

interface EducationEntry { // Renamed for clarity, as it's an entry from the 'entries' array
  degree: string;
  institution: string;
  period: string;
  description?: string; // description is optional in the new structure
  additionalInfo?: AdditionalInfo | null;
}

const EducationSection = () => {
  const { translations, loadingTranslations } = useLanguage();

  if (loadingTranslations || !translations) {
    // Basic loading state for EducationSection
    return (
      <section id="education" className="mb-12 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
        {[...Array(1)].map((_, i) => (
          <Card key={i} className="mb-6 bg-card border-border">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between mb-4">
                <div>
                  <div className="h-6 bg-muted rounded w-3/4 mb-1"></div>
                  <div className="h-5 bg-muted rounded w-1/2"></div>
                </div>
                <div className="mt-2 md:mt-0">
                  <div className="h-7 bg-muted rounded-full w-24"></div>
                </div>
              </div>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </CardContent>
          </Card>
        ))}
      </section>
    );
  }

  const t = translations; // Use translations from context
  // Get education data directly from the entries array in translations
  const educationEntries: EducationEntry[] = t.education.entries || [];

  return (
    <section id="education" className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-primary border-b border-border pb-2">{t.education.title}</h2>

      {educationEntries.map((edu, index) => (
        <Card key={index} className="mb-6 bg-card border-border">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">{edu.degree}</h3>
                <p className="text-primary font-medium">{edu.institution}</p>
              </div>
              <div className="mt-2 md:mt-0">
                <span className="inline-block bg-secondary text-muted-foreground rounded-full px-3 py-1 text-sm font-semibold">
                  {edu.period}
                </span>
              </div>
            </div>
            <p className="text-muted-foreground">{edu.description}</p>
            {edu.additionalInfo && (
              <div className="mt-2">
                <h4 className="font-semibold text-foreground">{edu.additionalInfo.title}</h4>
                <ul className="list-disc list-inside ml-4 text-muted-foreground">
                  {edu.additionalInfo.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </section>
  );
};

export default EducationSection;
