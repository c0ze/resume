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
        <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="md:flex">
              <div className="md:w-1/2 md:pr-4">
                <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-5/6 mb-6"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-muted mr-4"></div>
                      <div>
                        <div className="h-4 bg-muted rounded w-20 mb-1"></div>
                        <div className="h-4 bg-muted rounded w-32"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 md:mt-0 md:w-1/2 md:pl-4">
                <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
                <div className="flex space-x-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-12 h-12 rounded-full bg-muted"></div>
                  ))}
                </div>
                <div className="mt-8">
                  <div className="h-5 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-10 bg-muted rounded w-40"></div>
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
      <h2 className="text-2xl font-bold mb-6 text-primary border-b border-border pb-2">{t.contact.title}</h2>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="md:flex">
            <div className="md:w-1/2 md:pr-4">
              <h3 className="text-xl font-bold mb-4 text-foreground">{t.contact.getInTouch}</h3>

              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-4">
                    <AtSign className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <button
                      onClick={() => window.location.href = `mailto:${t.header.contactViaEmail}`}
                      className="text-primary hover:underline"
                    >
                      {t.contact.emailMe}
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-4">
                    <MapPinIcon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Location</p>
                    <p className="text-muted-foreground">{t.header.location}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-4">
                    <GlobeIcon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Website</p>
                    <a
                      href={t.header.website.startsWith('http') ? t.header.website : `https://${t.header.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {t.header.website}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 md:mt-0 md:w-1/2 md:pl-4">
              <h3 className="text-xl font-bold mb-4 text-foreground">{t.contact.findMeOn}</h3>
              <div className="flex space-x-4">
                {t.contact.socialLinks && t.contact.socialLinks.map(link => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-primary/20 hover:border-primary/50 transition-colors"
                    aria-label={link.name}
                  >
                    {link.name === 'LinkedIn' && <Linkedin className="h-6 w-6 text-foreground" />}
                    {link.name === 'GitHub' && <Github className="h-6 w-6 text-foreground" />}
                    {link.name !== 'LinkedIn' && link.name !== 'GitHub' && link.name}
                  </a>
                ))}
              </div>

              <div className="mt-8">
                <p className="font-medium mb-2 text-foreground">{t.header.downloadResume}</p>
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleDownloadResume}
                >
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  {t.header.downloadResume}
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
