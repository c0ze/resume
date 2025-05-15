declare module '*.js' {
  const content: any;
  export = content;
}

// Create type declarations for the translations module
declare module '../../../translations.js' {
  export const translations: {
    en: Record<string, any>;
    ja: Record<string, any>;
    tr: Record<string, any>;
  };
}

declare module './translations.js' {
  export const translations: {
    en: Record<string, any>;
    ja: Record<string, any>;
    tr: Record<string, any>;
  };
}