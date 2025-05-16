import { useState, useEffect } from "react";
import { Link } from "wouter"; // Link is imported but not used, can be removed if not needed elsewhere.
import { useLanguage } from "../contexts/LanguageContext";
// Removed: import { getTranslation } from "../translations";

const Navigation = () => {
  const [activeSection, setActiveSection] = useState("about");
  const { language, setLanguage, translations, loadingTranslations } = useLanguage();
  // const t = getTranslation(language); // Old way

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      const navHeight = document.querySelector("nav")?.offsetHeight || 0;
      
      let current = "";
      sections.forEach((section) => {
        const sectionElement = section as HTMLElement;
        const sectionTop = sectionElement.offsetTop - navHeight - 10;
        const sectionHeight = sectionElement.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
          current = sectionElement.getAttribute("id") || "";
        }
      });
      
      if (current && current !== activeSection) {
        setActiveSection(current);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeSection]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    const navHeight = document.querySelector("nav")?.offsetHeight || 0;
    
    if (section) {
      const sectionTop = section.offsetTop - navHeight;
      window.scrollTo({
        top: sectionTop,
        behavior: "smooth"
      });
      setActiveSection(sectionId);
    }
  };

  if (loadingTranslations || !translations) {
    // Basic loading state for navigation
    return (
      <nav className="sticky top-0 bg-white shadow-md z-10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <ul className="flex flex-wrap justify-center md:justify-start space-x-1 md:space-x-6 py-4">
              {[...Array(6)].map((_, i) => (
                <li key={i} className="px-3 py-2 rounded bg-gray-200 animate-pulse w-20 h-8"></li>
              ))}
            </ul>
            <div className="pb-4 md:py-4">
              <div className="px-3 py-2 rounded border border-gray-300 bg-gray-200 animate-pulse w-24 h-10"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const t = translations; // Use translations from context

  const sections = [
    { id: "about", label: t.navigation.about },
    { id: "experience", label: t.navigation.experience },
    { id: "education", label: t.navigation.education },
    { id: "skills", label: t.navigation.skills },
    { id: "projects", label: t.navigation.projects },
    { id: "contact", label: t.navigation.contact }
  ];

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "ja", label: "日本語" },
    { value: "tr", label: "Türkçe" }
  ];

  const handleLanguageChange = (newLanguage: string) => {
    // Type assertion since we know the values will always be 'en', 'ja', or 'tr'
    setLanguage(newLanguage as 'en' | 'ja' | 'tr');
  };

  return (
    <nav className="sticky top-0 bg-white shadow-md z-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <ul className="flex flex-wrap justify-center md:justify-start space-x-1 md:space-x-6 py-4">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={(e) => scrollToSection(e, section.id)}
                  className={`px-3 py-2 rounded transition-colors ${
                    activeSection === section.id ? "bg-gray-100" : "hover:bg-gray-100"
                  }`}
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="pb-4 md:py-4">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-2 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
