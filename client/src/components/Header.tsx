import { AtSign, MapPinIcon, GlobeIcon, DownloadIcon } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
// Removed: import { getTranslation } from "../translations";

const Header = () => {
  const { language, translations, loadingTranslations } = useLanguage();
  // const t = getTranslation(language); // Old way

  const handleDownloadResume = () => {
    // Download the resume based on the selected language
    let fileName;
    if (language === 'en') {
      fileName = 'resume-en.pdf'; // Updated filename
    } else if (language === 'ja') {
      fileName = 'resume-ja.pdf';
    } else if (language === 'tr') {
      fileName = 'resume-tr.pdf';
    } else {
      // Fallback or error handling if needed
      console.error("Unsupported language for resume download:", language);
      return;
    }

    // Construct the correct path using Vite's BASE_URL
    // import.meta.env.BASE_URL will be like "/resume/"
    // Ensure no double slashes if BASE_URL ends with / and fileName starts with / (though fileName here doesn't)
    const fullResumePath = `${import.meta.env.BASE_URL}${fileName}`;

    // Add a timestamp to prevent caching
    const pathWithTimestamp = `${fullResumePath}?t=${Date.now()}`;
    
    // For debugging
    console.log(`Downloading resume for language: ${language}, path: ${pathWithTimestamp}`);
    
    // Open in a new tab
    window.open(pathWithTimestamp, '_blank');
  };

  if (loadingTranslations || !translations) {
    // You can return a loading spinner or a skeleton UI here
    return (
      <header className="bg-primary text-white py-12 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </header>
    );
  }

  const t = translations; // Use the translations from context

  return (
    <header className="bg-primary text-white py-12 px-4 md:px-8">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">{t.header.title}</h1>
            <p className="text-xl mt-2">{t.header.subtitle}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center mt-2">
              <AtSign className="h-5 w-5 mr-3" />
              <button
                onClick={() => window.location.href = `mailto:${t.header.contactViaEmail}`}
                className="hover:text-blue-300 transition-colors"
              >
                {t.header.contactViaEmail}
              </button>
            </div>
            <div className="flex items-center mt-2">
              <MapPinIcon className="h-5 w-5 mr-3" />
              <span>{t.header.location}</span>
            </div>
            <div className="flex items-center mt-2">
              <GlobeIcon className="h-5 w-5 mr-3" />
              <a href={t.header.website.startsWith('http') ? t.header.website : `https://${t.header.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors">
                {t.header.website}
              </a>
            </div>
            <div className="flex items-center mt-4">
              <button
                onClick={handleDownloadResume}
                className="flex items-center bg-white text-primary font-medium py-2 px-4 rounded hover:bg-opacity-90 transition-colors"
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
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
