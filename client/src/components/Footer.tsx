import { useLanguage } from "../contexts/LanguageContext";

const Footer = () => {
  const { translations, loadingTranslations } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  if (loadingTranslations || !translations || !translations.footer) {
    // Basic loading state for Footer
    return (
      <footer className="bg-primary text-white py-6 px-4 md:px-8 mt-auto animate-pulse">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="mt-4 md:mt-0">
              <div className="h-4 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        </div>
      </footer>
    );
  }
  
  const t = translations;

  return (
    <footer className="bg-primary text-white py-6 px-4 md:px-8 mt-auto">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            {/* Assuming copyright string in footer.json might not include the dynamic year */}
            <p>{t.footer.copyright.replace('{year}', new Date().getFullYear().toString())}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={scrollToTop}
              className="text-white hover:text-blue-300 transition-colors"
            >
              {/* Assuming a 'backToTop' key will be added to footer.json */}
              { (t.footer as any).backToTop || 'Back to top' }
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
