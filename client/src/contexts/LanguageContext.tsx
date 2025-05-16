import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTranslation, Translations } from '../translations'; // Assuming Translations type is exported from index.ts

// Define available languages
export type Language = 'en' | 'ja' | 'tr';

// Language context type
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: Translations | null; // Can be null while loading or if error
  loadingTranslations: boolean;
}

// Create the language context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Create LanguageProvider component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en'); // Default language
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [loadingTranslations, setLoadingTranslations] = useState<boolean>(true);

  useEffect(() => {
    let active = true; // Prevent state updates on unmounted component
    setLoadingTranslations(true);

    getTranslation(language)
      .then((loadedTranslations) => {
        if (active) {
          setTranslations(loadedTranslations);
          setLoadingTranslations(false);
        }
      })
      .catch((error) => {
        console.error(`Failed to load translations for ${language}`, error);
        if (active) {
          setTranslations(null); // Or set to some default/fallback translations
          setLoadingTranslations(false);
        }
      });

    return () => {
      active = false; // Cleanup function to set active to false when component unmounts
    };
  }, [language]); // Rerun effect when language changes

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations, loadingTranslations }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};