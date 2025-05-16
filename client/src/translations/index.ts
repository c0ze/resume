import { Language } from '../contexts/LanguageContext';

// Define the structure for a single language's content
export interface Translations {
  header: {
    title: string;
    subtitle: string;
    contactViaEmail: string;
    location: string;
    website: string;
    downloadResume: string;
  };
  about: {
    title: string;
    paragraph1: string;
    paragraph2?: string;
    languages: string;
    languagesContent: string;
  };
  experience: {
    title: string;
    jobs: Array<{
      title: string;
      company: string;
      period: string;
      responsibilities: string[];
    }>;
  };
  education: {
    title: string;
    entries: Array<{
      degree: string;
      institution: string;
      period: string;
      description?: string;
      additionalInfo?: { title: string; items: string[] } | null;
    }>;
  };
  skills: {
    title: string;
    technicalSkillsTitle: string;
    technicalSkills: string[];
  };
  projects: {
    title: string;
    entries: Array<{
      title: string;
      technologies: string;
      description: string;
    }>;
  };
  pdf_meta: {
    title: string;
    author: string;
    subject: string;
    keywords: string;
    generatedOn: string;
  };
  navigation: {
    about: string;
    experience: string;
    education: string;
    skills: string;
    projects: string;
    contact: string;
  };
  contact: {
    title: string;
    getInTouch: string;
    emailMe: string;
    findMeOn: string;
    socialLinks?: Array<{
      name: string;
      url: string;
    }>;
  };
  footer: {
    copyright: string;
    backToTop?: string; // Added optional backToTop
  };
}

// Use import.meta.glob to make Vite aware of all possible JSON files
// The path is relative to the current file: client/src/translations/index.ts
const allContentModules = import.meta.glob('../../../content/**/*.json'); // Corrected path

// Helper to import a JSON module using the globbed modules
const loadJson = async (lang: Language, fileName: string): Promise<any> => {
  // Construct the key for the allContentModules object, matching the glob pattern structure
  const moduleKey = `../../../content/${lang}/${fileName}.json`;
  
  if (allContentModules[moduleKey]) {
    try {
      // Assert the type of the dynamically imported module
      const module: { default: any } = await allContentModules[moduleKey]() as { default: any };
      return module.default;
    } catch (error) {
      console.error(`Error executing module function for ${moduleKey}:`, error);
      return {}; // Return empty object on error
    }
  } else {
    console.error(`Module not found in glob for path: ${moduleKey}. Available paths:`, Object.keys(allContentModules));
    return {}; // Return empty object if path not in glob
  }
};

// Async hook to get translations based on selected language
export const getTranslation = async (language: Language): Promise<Translations | null> => {
  try {
    const [
      header,
      about,
      experience,
      education,
      skills,
      projects,
      pdf_meta,
      navigation,
      contact,
      footer
    ] = await Promise.all([
      loadJson(language, 'header'),
      loadJson(language, 'about'),
      loadJson(language, 'experience'),
      loadJson(language, 'education'),
      loadJson(language, 'skills'),
      loadJson(language, 'projects'),
      loadJson(language, 'pdf_meta'),
      loadJson(language, 'navigation'),
      loadJson(language, 'contact'),
      loadJson(language, 'footer')
    ]);

    // Check if core content loaded (you might want more granular checks or fallbacks)
    if (!header || Object.keys(header).length === 0 || 
        !about || Object.keys(about).length === 0 ||
        !navigation || Object.keys(navigation).length === 0 // Example check for navigation
        /* add other essential checks if needed */
       ) {
        console.error(`Core translation files might be missing or empty for language: ${language}`);
        // Optionally, you could try to load 'en' as a fallback here if language !== 'en'
        // For now, returning null or a partial object might be better than throwing.
        // return null; 
    }
    
    return {
      header,
      about,
      experience,
      education,
      skills,
      projects,
      pdf_meta,
      navigation,
      contact,
      footer
    } as Translations;
  } catch (error) {
    console.error(`Failed to get translations for language ${language}:`, error);
    return null;
  }
};