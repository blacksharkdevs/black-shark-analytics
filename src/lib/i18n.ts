import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationEN from "@/locales/en/translation.json";
import translationPT from "@/locales/pt-BR/translation.json";

const resources = {
  en: {
    translation: translationEN,
  },
  "pt-BR": {
    translation: translationPT,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("language") || "pt-BR",
  fallbackLng: "pt-BR",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
