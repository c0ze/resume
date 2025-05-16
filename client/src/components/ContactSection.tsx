import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AtSign, MapPinIcon, GlobeIcon, DownloadIcon, Linkedin, Github } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
// Removed: import { getTranslation } from "../translations";

const ContactSection = () => {
  const { language, translations, loadingTranslations } = useLanguage();

  const handleDownloadResume = () => {
    let fileName;
    if (language === 'en') {
      fileName = 'resume-en.pdf'; // Updated filename
    } else if (language === 'ja') {
      fileName = 'resume-ja.pdf';
    } else if (language === 'tr') {
      fileName = 'resume-tr.pdf';
    } else {
      console.error("Unsupported language for resume download:", language);
      return;
    }
    // Construct the correct path using Vite's BASE_URL
    const fullResumePath = `${import.meta.env.BASE_URL}${fileName}`;
    const pathWithTimestamp = `${fullResumePath}?t=${Date.now()}`;
    
    console.log(`Downloading resume from ContactSection for language: ${language}, path: ${pathWithTimestamp}`);
    window.open(pathWithTimestamp, '_blank');
  };

  if (loadingTranslations || !translations || !translations.contact || !translations.header) {
    // Basic loading state for ContactSection
    return (
      <section id="contact" className="mb-12 animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
        <Card>
          <CardContent className="p-6">
            <div className="md:flex">
              <div className="md:w-1/2 md:pr-4">
                <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6 mb-6"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-300 mr-4"></div>
                      <div>
                        <div className="h-4 bg-gray-300 rounded w-20 mb-1"></div>
                        <div className="h-4 bg-gray-300 rounded w-32"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 md:mt-0 md:w-1/2 md:pl-4">
                <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
                <div className="flex space-x-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-12 h-12 rounded-full bg-gray-300"></div>
                  ))}
                </div>
                <div className="mt-8">
                  <div className="h-5 bg-gray-300 rounded w-1/4 mb-2"></div>
                  <div className="h-10 bg-gray-300 rounded w-40"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const t = translations; // Use translations from context

  return (
    <section id="contact" className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-primary border-b pb-2">{t.contact.title}</h2>
      
      <Card className="dark:bg-slate-800">
        <CardContent className="p-6">
          <div className="md:flex">
            <div className="md:w-1/2 md:pr-4">
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">{t.contact.getInTouch}</h3>
              {/* The hardcoded paragraph can be replaced by a field in contact.json if needed */}
              {/* <p className="mb-6 text-gray-600 dark:text-gray-400">Feel free to reach out for collaboration opportunities, job inquiries, or just to say hello!</p> */}
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-4">
                    <AtSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-200">Email</p>
                    <button
                      onClick={() => window.location.href = `mailto:${t.header.contactViaEmail}`}
                      className="text-primary hover:underline dark:text-blue-400"
                    >
                      {t.contact.emailMe}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-4">
                    <MapPinIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-200">Location</p> {/* Assuming 'Location' is a static label */}
                    <p className="text-gray-600 dark:text-gray-400">{t.header.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-4">
                    <GlobeIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-200">Website</p> {/* Assuming 'Website' is a static label */}
                    <a
                      href={t.header.website.startsWith('http') ? t.header.website : `https://${t.header.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline dark:text-blue-400"
                    >
                      {t.header.website}
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 md:mt-0 md:w-1/2 md:pl-4">
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">{t.contact.findMeOn}</h3>
              <div className="flex space-x-4">
                {t.contact.socialLinks && t.contact.socialLinks.map(link => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-gray-700 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors text-white"
                    aria-label={link.name}
                  >
                    {link.name === 'LinkedIn' && <Linkedin className="h-6 w-6 text-white" />}
                    {link.name === 'GitHub' && <Github className="h-6 w-6 text-white" />}
                    {/* Fallback for other links if any, or remove if only these two are expected */}
                    {link.name !== 'LinkedIn' && link.name !== 'GitHub' && link.name}
                  </a>
                ))}
              </div>
              
              <div className="mt-8">
                <p className="font-medium mb-2 text-gray-700 dark:text-gray-200">{t.header.downloadResume}</p>
                <Button
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={handleDownloadResume}
                >
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  {t.header.downloadResume} {/* Using header's downloadResume text */}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default ContactSection;
