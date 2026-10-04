import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { translations } from "../i18n/translations";
import { pagesTranslations } from "../i18n/pagesTranslations";

const LanguageContext = createContext(null);

const STORAGE_KEY = "evolve_lang";

// Fusionne les deux fichiers de traductions
const allTranslations = {
  fr: { ...translations.fr, ...pagesTranslations.fr },
  en: { ...translations.en, ...pagesTranslations.en },
};

const resolve = (object, key) =>
  key.split(".").reduce((current, part) => (current ? current[part] : undefined), object);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "en" || saved === "fr" ? saved : "fr";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key) => {
      const value = resolve(allTranslations[lang], key);
      if (value !== undefined) return value;

      const fallback = resolve(allTranslations.fr, key);
      return fallback !== undefined ? fallback : key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage doit être utilisé à l'intérieur de LanguageProvider");
  }
  return context;
}