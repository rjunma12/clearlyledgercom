import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from '@/locales/en/common.json';
import enHome from '@/locales/en/home.json';
import jaCommon from '@/locales/ja/common.json';
import jaHome from '@/locales/ja/home.json';
import msCommon from '@/locales/ms/common.json';
import msHome from '@/locales/ms/home.json';
import hiCommon from '@/locales/hi/common.json';
import hiHome from '@/locales/hi/home.json';
import arCommon from '@/locales/ar/common.json';
import arHome from '@/locales/ar/home.json';
import esCommon from '@/locales/es/common.json';
import esHome from '@/locales/es/home.json';
import frCommon from '@/locales/fr/common.json';
import frHome from '@/locales/fr/home.json';

export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
] as const;

export type SupportedLanguage = typeof supportedLanguages[number]['code'];

const resources = {
  en: {
    common: enCommon,
    home: enHome,
  },
  es: {
    common: esCommon,
    home: esHome,
  },
  fr: {
    common: frCommon,
    home: frHome,
  },
  ja: {
    common: jaCommon,
    home: jaHome,
  },
  ms: {
    common: msCommon,
    home: msHome,
  },
  hi: {
    common: hiCommon,
    home: hiHome,
  },
  ar: {
    common: arCommon,
    home: arHome,
  },
};

// Initialize i18n synchronously without side effects
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'home'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Disable suspense to prevent issues
    },
  });

// Helper function to update document direction (call this from a React effect)
export const updateDocumentDirection = (lng: string) => {
  const language = supportedLanguages.find(l => l.code === lng);
  if (language) {
    document.documentElement.dir = language.dir;
    document.documentElement.lang = lng;
  }
};

export default i18n;
