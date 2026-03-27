import { AtSign, MapPinIcon, GlobeIcon, DownloadIcon } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const Header = () => {
  const { language, translations, loadingTranslations } = useLanguage();

  const handleDownload = (ext: string) => {
    const fileName = `resume-${language}.${ext}`;
    const fullPath = `${import.meta.env.BASE_URL}${fileName}?t=${Date.now()}`;
    window.open(fullPath, '_blank');
  };

  if (loadingTranslations || !translations) {
    return (
      <header className="bg-card border-b border-border py-5 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-5 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </header>
    );
  }

  const t = translations;

  return (
    <header className="bg-card border-b border-border py-5 px-4 md:px-8">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-0.5">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              {t.header.title}
            </h1>
            <p className="text-base text-muted-foreground">
              {t.header.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <button
              onClick={() => window.location.href = `mailto:${t.header.contactViaEmail}`}
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <AtSign className="h-3.5 w-3.5" />
              {t.header.contactViaEmail}
            </button>
            <span className="flex items-center gap-1.5">
              <MapPinIcon className="h-3.5 w-3.5" />
              {t.header.location}
            </span>
            <a
              href={t.header.website.startsWith('http') ? t.header.website : `https://${t.header.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <GlobeIcon className="h-3.5 w-3.5" />
              {t.header.website}
            </a>
            <span className="flex items-center gap-1.5">
              <DownloadIcon className="h-3.5 w-3.5" />
              <button
                type="button"
                onClick={() => handleDownload('pdf')}
                className="bg-primary text-primary-foreground font-medium py-1 px-2.5 rounded text-sm hover:opacity-90 transition-opacity"
              >
                {t.header.downloadPdf || 'PDF'}
              </button>
              <button
                type="button"
                onClick={() => handleDownload('docx')}
                className="bg-primary text-primary-foreground font-medium py-1 px-2.5 rounded text-sm hover:opacity-90 transition-opacity"
              >
                {t.header.downloadDocx || 'DOCX'}
              </button>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
