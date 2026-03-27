import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { ThemeToggle } from "./ThemeToggle";

const Navigation = () => {
  const [activeSection, setActiveSection] = useState("about");
  const { language, setLanguage, translations, loadingTranslations } = useLanguage();

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
    return (
      <nav className="sticky top-0 bg-card/80 backdrop-blur-sm border-b border-border z-10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <ul className="flex flex-wrap justify-center md:justify-start gap-1 py-4">
              {[...Array(6)].map((_, i) => (
                <li key={i} className="px-3 py-2 rounded bg-muted animate-pulse w-20 h-8"></li>
              ))}
            </ul>
            <div className="pb-4 md:py-4 flex items-center gap-3">
              <div className="px-3 py-2 rounded bg-muted animate-pulse w-24 h-10"></div>
              <div className="w-9 h-9 rounded-full bg-muted animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const t = translations;

  const sections = [
    { id: "about", label: t.navigation.about },
    { id: "experience", label: t.navigation.experience },
    { id: "education", label: t.navigation.education },
    { id: "skills", label: t.navigation.skills },
    { id: "projects", label: t.navigation.projects },
    { id: "contact", label: t.navigation.contact }
  ];

  const languageOptions = [
    { value: "en", label: "EN" },
    { value: "ja", label: "JA" },
    { value: "tr", label: "TR" }
  ];

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as 'en' | 'ja' | 'tr');
  };

  return (
    <nav className="sticky top-0 bg-card/80 backdrop-blur-sm border-b border-border z-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between gap-2 py-2.5">
          <div className="flex flex-wrap items-center gap-1 min-w-0">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={(e) => scrollToSection(e, section.id)}
                className={`px-2.5 py-1.5 rounded text-sm whitespace-nowrap transition-colors ${
                  activeSection === section.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {section.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-2 py-1.5 rounded text-sm border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
