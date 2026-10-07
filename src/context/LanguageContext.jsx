import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { translate } from "../i18n";

const LanguageContext = createContext(null);

const STORAGE_KEY = "evolve_app_lang";
const DEFAULT_LANG = "en";

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "en" || saved === "fr" ? saved : DEFAULT_LANG;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback((key) => translate(lang, key), [lang]);

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