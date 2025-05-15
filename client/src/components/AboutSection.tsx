import { Card } from "@/components/ui/card";
import { useLanguage } from "../contexts/LanguageContext";
import { getTranslation } from "../translations";

const AboutSection = () => {
  const { language } = useLanguage();
  const t = getTranslation(language);

  return (
    <section id="about" className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-primary border-b pb-2">{t.about.title}</h2>
      <div className="md:flex">
        <div className="md:w-3/4">
          <p className="mb-4">
            {t.about.paragraph1}
          </p>
          <p>
            {t.about.paragraph2}
          </p>
        </div>
        <div className="mt-6 md:mt-0 md:w-1/4 md:pl-6">
          <Card className="p-4">
            <h3 className="font-bold text-lg mb-2">{t.about.quickInfo}</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="font-medium w-24">{t.about.location}</span>
                <span>{t.header.location}</span>
              </li>
              <li className="flex items-start">
                <span className="font-medium w-24">{t.about.languages}</span>
                <span>{t.about.languagesContent}</span>
              </li>
              <li className="flex items-start">
                <span className="font-medium w-24">{t.about.interests}</span>
                <span>{t.about.interestsContent}</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
