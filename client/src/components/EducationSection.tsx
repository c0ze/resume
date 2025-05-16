import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "../contexts/LanguageContext";
// Removed: import { getTranslation } from "../translations";

// Interface can remain the same as it matches the structure within the entries array
interface EducationEntry { // Renamed for clarity, as it's an entry from the 'entries' array
  degree: string;
  institution: string;
  period: string;
  description?: string; // description is optional in the new structure
  additionalInfo?: string;
}

const EducationSection = () => {
  const { translations, loadingTranslations } = useLanguage();

  if (loadingTranslations || !translations) {
    // Basic loading state for EducationSection
    return (
      <section id="education" className="mb-12 animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
        {[...Array(1)].map((_, i) => ( // Skeleton for 1 education card
          <Card key={i} className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between mb-4">
                <div>
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-1"></div>
                  <div className="h-5 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="mt-2 md:mt-0">
                  <div className="h-7 bg-gray-300 rounded-full w-24"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
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
      <h2 className="text-2xl font-bold mb-6 text-primary border-b pb-2">{t.education.title}</h2>
      
      {educationEntries.map((edu, index) => (
        <Card key={index} className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">{edu.degree}</h3>
                <p className="text-blue-500 font-medium">{edu.institution}</p>
              </div>
              <div className="mt-2 md:mt-0">
                <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold">
                  {edu.period}
                </span>
              </div>
            </div>
            <p>{edu.description}</p>
            {edu.additionalInfo && <p className="mt-2">{edu.additionalInfo}</p>}
          </CardContent>
        </Card>
      ))}
    </section>
  );
};

export default EducationSection;
