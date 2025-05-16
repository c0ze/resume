import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "../contexts/LanguageContext";
// Removed: import { getTranslation } from "../translations";

// Interface can remain the same as it matches the structure within the jobs array
interface Experience {
  title: string;
  company: string;
  period: string;
  responsibilities: string[];
}

const ExperienceSection = () => {
  const { translations, loadingTranslations } = useLanguage();

  if (loadingTranslations || !translations) {
    // Basic loading state for ExperienceSection
    return (
      <section id="experience" className="mb-12 animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
        {[...Array(2)].map((_, i) => ( // Skeleton for 2 job cards
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
              <ul className="list-disc pl-5 space-y-2">
                <li className="h-4 bg-gray-300 rounded w-full"></li>
                <li className="h-4 bg-gray-300 rounded w-5/6"></li>
                <li className="h-4 bg-gray-300 rounded w-full"></li>
              </ul>
            </CardContent>
          </Card>
        ))}
      </section>
    );
  }
  
  const t = translations; // Use translations from context
  // Get experience data directly from the jobs array in translations
  const experiences: Experience[] = t.experience.jobs || [];

  return (
    <section id="experience" className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-primary border-b pb-2">{t.experience.title}</h2>
      
      {experiences.map((exp, index) => (
        <Card key={index} className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">{exp.title}</h3>
                <p className="text-blue-500 font-medium">{exp.company}</p>
              </div>
              <div className="mt-2 md:mt-0">
                <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold">
                  {exp.period}
                </span>
              </div>
            </div>
            <ul className="list-disc pl-5 space-y-2">
              {exp.responsibilities.map((responsibility, idx) => (
                <li key={idx}>{responsibility}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </section>
  );
};

export default ExperienceSection;
