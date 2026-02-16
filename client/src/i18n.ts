import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

/**
 * i18n Configuration for Boptone
 * 
 * Supports 10 languages:
 * - English (en)
 * - Spanish (es)
 * - Portuguese (pt)
 * - French (fr)
 * - German (de)
 * - Japanese (ja)
 * - Korean (ko)
 * - Chinese (zh)
 * - Hindi (hi)
 * - Arabic (ar)
 */

i18n
  // Load translations from /public/locales
  .use(HttpBackend)
  // Detect user language from browser/localStorage
  .use(LanguageDetector)
  // Pass i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Fallback language if translation not found
    fallbackLng: 'en',
    
    // Supported languages
    supportedLngs: ['en', 'es', 'pt', 'fr', 'de', 'ja', 'ko', 'zh', 'hi', 'ar'],
    
    // Debug mode (disable in production)
    debug: import.meta.env.DEV,
    
    // Namespace for translations
    ns: ['translation'],
    defaultNS: 'translation',
    
    // Language detection order
    detection: {
      // Order of language detection
      order: [
        'localStorage',      // Check localStorage first (user preference)
        'navigator',         // Then browser language
        'htmlTag',          // Then HTML lang attribute
      ],
      
      // Cache user language preference
      caches: ['localStorage'],
      
      // localStorage key
      lookupLocalStorage: 'boptone_language',
    },
    
    // Backend configuration
    backend: {
      // Path to translation files
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    // React-specific options
    react: {
      // Wait for translations to load before rendering
      useSuspense: true,
    },
    
    // Interpolation options
    interpolation: {
      // React already escapes values
      escapeValue: false,
    },
  });

export default i18n;
