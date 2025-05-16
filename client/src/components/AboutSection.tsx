import { Card } from "@/components/ui/card";
import { useLanguage } from "../contexts/LanguageContext";
// Removed: import { getTranslation } from "../translations";

const AboutSection = () => {
  const { translations, loadingTranslations } = useLanguage();

  if (loadingTranslations || !translations) {
    // Basic loading state for AboutSection
    return (
      <section id="about" className="mb-12 animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
        <div className="md:flex">
          <div className="md:w-3/4">
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-4/6 mb-4"></div>
            {/* paragraph2 might be empty */}
          </div>
          <div className="mt-6 md:mt-0 md:w-1/4 md:pl-6">
            <Card className="p-4">
              <div className="h-6 bg-gray-300 rounded w-1/2 mb-3"></div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="h-4 bg-gray-300 rounded w-20 mr-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </li>
                <li className="flex items-start">
                  <div className="h-4 bg-gray-300 rounded w-20 mr-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  const t = translations; // Use translations from context

  return (
    <section id="about" className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-primary border-b pb-2">{t.about.title}</h2>
      <div className="md:flex">
        <div className="md:w-3/4 pr-0 md:pr-6"> {/* Added padding to the right for better spacing */}
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {t.about.paragraph1}
          </p>
          {t.about.paragraph2 && ( // Only render paragraph2 if it exists
            <p className="text-gray-700 dark:text-gray-300">
              {t.about.paragraph2}
            </p>
          )}
        </div>
        <div className="mt-6 md:mt-0 md:w-1/4 md:pl-0 lg:pl-6"> {/* Adjusted padding for responsiveness */}
          <Card className="p-4 bg-slate-50 dark:bg-slate-800"> {/* Added subtle background */}
            {/* Quick Info section removed as per new content structure */}
            {/* We can display languages here directly if desired, or other key info */}
            <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-100">{t.about.languages}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t.about.languagesContent}</p>
            
            {/* Example: Displaying location from header (if needed here) */}
            {/* <h3 className="font-semibold text-lg mt-4 mb-2 text-gray-800 dark:text-gray-100">Location</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t.header.location}</p> */}
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
