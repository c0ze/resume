import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "../contexts/LanguageContext";
import { getTranslation } from "../translations";

interface Experience {
  title: string;
  company: string;
  period: string;
  responsibilities: string[];
}

const ExperienceSection = () => {
  const { language } = useLanguage();
  const t = getTranslation(language);
  
  // Get experience data from translations
  const experiences: Experience[] = [
    {
      title: t.experience.job1.title,
      company: t.experience.job1.company,
      period: t.experience.job1.period,
      responsibilities: t.experience.job1.responsibilities
    },
    {
      title: t.experience.job2.title,
      company: t.experience.job2.company,
      period: t.experience.job2.period,
      responsibilities: t.experience.job2.responsibilities
    },
    {
      title: t.experience.job3.title,
      company: t.experience.job3.company,
      period: t.experience.job3.period,
      responsibilities: t.experience.job3.responsibilities
    }
  ];

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
