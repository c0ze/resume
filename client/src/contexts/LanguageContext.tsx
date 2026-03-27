import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getTranslationSync } from '../translations';
import type { Translations } from '../translations';

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
export const LanguageProvider: React.FC<{ children: ReactNode; initialLanguage?: Language }> = ({
  children,
  initialLanguage = 'en',
}) => {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const translations = getTranslationSync(language);
  const loadingTranslations = translations === null;

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
