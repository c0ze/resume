import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "../contexts/LanguageContext";
import { getTranslation } from "../translations";

interface Education {
  degree: string;
  institution: string;
  period: string;
  description: string;
  additionalInfo?: string;
}

const EducationSection = () => {
  const { language } = useLanguage();
  const t = getTranslation(language);

  // Get education data from translations
  const educations: Education[] = [
    {
      degree: t.education.university.degree,
      institution: t.education.university.institution,
      period: t.education.university.period,
      description: t.education.university.description,
      additionalInfo: t.education.university.additionalInfo
    },
    {
      degree: t.education.highSchool.degree,
      institution: t.education.highSchool.institution,
      period: t.education.highSchool.period,
      description: t.education.highSchool.description
    }
  ];

  return (
    <section id="education" className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-primary border-b pb-2">{t.education.title}</h2>
      
      {educations.map((edu, index) => (
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
