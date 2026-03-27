import type { Language } from '../contexts/LanguageContext';

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

const allContentModules = import.meta.glob('../../../content/**/*.json', {
  eager: true,
  import: 'default',
});

const loadJsonSync = (lang: Language, fileName: string) => {
  const moduleKey = `../../../content/${lang}/${fileName}.json`;
  const module = allContentModules[moduleKey];

  if (!module) {
    console.error(`Module not found in glob for path: ${moduleKey}`);
    return {};
  }

  return module;
};

export const getTranslationSync = (language: Language): Translations | null => {
  try {
    const header = loadJsonSync(language, 'header');
    const about = loadJsonSync(language, 'about');
    const experience = loadJsonSync(language, 'experience');
    const education = loadJsonSync(language, 'education');
    const skills = loadJsonSync(language, 'skills');
    const projects = loadJsonSync(language, 'projects');
    const pdf_meta = loadJsonSync(language, 'pdf_meta');
    const navigation = loadJsonSync(language, 'navigation');
    const contact = loadJsonSync(language, 'contact');
    const footer = loadJsonSync(language, 'footer');

    if (
      !header || Object.keys(header).length === 0 ||
      !about || Object.keys(about).length === 0 ||
      !navigation || Object.keys(navigation).length === 0
    ) {
      console.error(`Core translation files might be missing or empty for language: ${language}`);
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
      footer,
    } as Translations;
  } catch (error) {
    console.error(`Failed to get translations for language ${language}:`, error);
    return null;
  }
};

export const getTranslation = async (language: Language): Promise<Translations | null> =>
  getTranslationSync(language);
