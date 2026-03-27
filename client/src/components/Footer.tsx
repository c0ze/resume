import { useLanguage } from "../contexts/LanguageContext";
import { ArrowUp } from "lucide-react";

const Footer = () => {
  const { translations, loadingTranslations } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  if (loadingTranslations || !translations || !translations.footer) {
    return (
      <footer className="bg-card border-t border-border py-8 px-4 md:px-8 mt-auto animate-pulse">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="mt-4 md:mt-0">
              <div className="h-4 bg-muted rounded w-24"></div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  const t = translations;

  return (
    <footer className="bg-card border-t border-border py-4 px-4 md:px-8 mt-auto">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {t.footer.copyright.replace('{year}', new Date().getFullYear().toString())}
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {(t.footer as any).backToTop || 'Back to top'}
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
