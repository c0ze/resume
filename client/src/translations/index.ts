import { Language } from '../contexts/LanguageContext';
import { translations } from '../../../translations.js';

// Define the structure of the translations
export type Translations = typeof translations.en;

// Hook to get translations based on selected language
export const getTranslation = (language: Language): Translations => {
  return translations[language];
};