import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './locales/en.json';
import bgTranslations from './locales/bg.json';

// Translation files mapping
const resources = {
  en: {
    translation: enTranslations
  },
  bg: {
    translation: bgTranslations
  }
};

const savedLang = localStorage.getItem('lang') || 'bg';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: savedLang, // default language
    fallbackLng: 'bg',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
