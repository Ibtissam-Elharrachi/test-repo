import { translations } from "./translations";
import { pagesTranslations } from "./pagesTranslations";
import { extraTranslations } from "./extraTranslations";
import { moreTranslations } from "./moreTranslations";

const isObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value);

// Fusionne les fichiers de traduction (les derniers complètent/remplacent les premiers)
const merge = (base, extra) => {
  const result = { ...base };
  Object.keys(extra).forEach((key) => {
    result[key] =
      isObject(result[key]) && isObject(extra[key])
        ? merge(result[key], extra[key])
        : extra[key];
  });
  return result;
};

const build = (lang) =>
  [translations, pagesTranslations, extraTranslations, moreTranslations].reduce(
    (accumulator, source) => merge(accumulator, source[lang] || {}),
    {}
  );

export const allTranslations = {
  fr: build("fr"),
  en: build("en"),
};

const resolve = (object, key) =>
  key.split(".").reduce((current, part) => (current ? current[part] : undefined), object);

// translate("fr", "auth.title") -> texte dans la langue demandée
export const translate = (lang, key) => {
  const value = resolve(allTranslations[lang], key);
  if (value !== undefined) return value;

  const fallback = resolve(allTranslations.fr, key);
  return fallback !== undefined ? fallback : key;
};