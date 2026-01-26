import { AtSign, MapPinIcon, GlobeIcon, DownloadIcon } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const Header = () => {
  const { language, translations, loadingTranslations } = useLanguage();

  const handleDownloadResume = () => {
    let fileName;
    if (language === 'en') {
      fileName = 'resume-en.pdf';
    } else if (language === 'ja') {
      fileName = 'resume-ja.pdf';
    } else if (language === 'tr') {
      fileName = 'resume-tr.pdf';
    } else {
      console.error("Unsupported language for resume download:", language);
      return;
    }

    const fullResumePath = `${import.meta.env.BASE_URL}${fileName}`;
    const pathWithTimestamp = `${fullResumePath}?t=${Date.now()}`;
    console.log(`Downloading resume for language: ${language}, path: ${pathWithTimestamp}`);
    window.open(pathWithTimestamp, '_blank');
  };

  if (loadingTranslations || !translations) {
    return (
      <header className="bg-card border-b border-border py-16 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </header>
    );
  }

  const t = translations;

  return (
    <header className="bg-card border-b border-border py-16 px-4 md:px-8">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
              {t.header.title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t.header.subtitle}
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-muted-foreground">
              <AtSign className="h-4 w-4" />
              <button
                onClick={() => window.location.href = `mailto:${t.header.contactViaEmail}`}
                className="hover:text-primary transition-colors text-sm"
              >
                {t.header.contactViaEmail}
              </button>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPinIcon className="h-4 w-4" />
              <span className="text-sm">{t.header.location}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <GlobeIcon className="h-4 w-4" />
              <a
                href={t.header.website.startsWith('http') ? t.header.website : `https://${t.header.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors text-sm"
              >
                {t.header.website}
              </a>
            </div>
            <div className="pt-2">
              <button
                onClick={handleDownloadResume}
                className="flex items-center gap-2 bg-primary text-primary-foreground font-medium py-2 px-4 rounded text-sm hover:opacity-90 transition-opacity"
              >
                <DownloadIcon className="h-4 w-4" />
                {t.header.downloadResume}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
