import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Only import English translations statically - others are lazy-loaded
import enCommon from '@/locales/en/common.json';
import enHome from '@/locales/en/home.json';

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

// Normalize locale codes (e.g., "en-US" -> "en", "fr-CA" -> "fr")
const normalizeLanguage = (lng: string): string => {
  if (!lng) return 'en';
  const baseCode = lng.split('-')[0].toLowerCase();
  const isSupported = supportedLanguages.some(l => l.code === baseCode);
  return isSupported ? baseCode : 'en';
};

// Inline minimal language detection (removes ~15KB i18next-browser-languagedetector)
const getInitialLanguage = (): string => {
  try {
    const stored = localStorage.getItem('i18nextLng');
    if (stored) {
      const normalized = normalizeLanguage(stored);
      if (supportedLanguages.some(l => l.code === normalized)) return normalized;
    }
  } catch {
    // localStorage not available
  }
  
  const nav = navigator.language?.split('-')[0] || 'en';
  return supportedLanguages.some(l => l.code === nav) ? nav : 'en';
};

// Cache for loaded languages to prevent duplicate loads
const loadedLanguages = new Set<string>(['en']);

// Lazy load translations for non-English languages
export const loadLanguage = async (lng: string): Promise<void> => {
  const normalizedLng = normalizeLanguage(lng);
  if (normalizedLng === 'en' || loadedLanguages.has(normalizedLng)) return;
  
  try {
    const [common, home] = await Promise.all([
      import(`../locales/${normalizedLng}/common.json`),
      import(`../locales/${normalizedLng}/home.json`),
    ]);
    
    i18n.addResourceBundle(normalizedLng, 'common', common.default, true, true);
    i18n.addResourceBundle(normalizedLng, 'home', home.default, true, true);
    loadedLanguages.add(normalizedLng);
  } catch (error) {
    console.warn(`Failed to load language: ${normalizedLng}`, error);
  }
};

const resources = {
  en: {
    common: enCommon,
    home: enHome,
  },
};

// Initialize i18n synchronously with English only (inline detection for speed)
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'home'],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Load non-English language if detected
const initialLng = getInitialLanguage();
if (initialLng !== 'en') {
  loadLanguage(initialLng);
}

// Helper function to update document direction (call this from a React effect)
export const updateDocumentDirection = (lng: string) => {
  const normalizedLng = normalizeLanguage(lng);
  const language = supportedLanguages.find(l => l.code === normalizedLng);
  if (language) {
    document.documentElement.dir = language.dir;
    document.documentElement.lang = normalizedLng;
  }
};

export default i18n;
