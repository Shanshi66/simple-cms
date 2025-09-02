import en from "@/i18n/messages/en";
import zhCN from "@/i18n/messages/zh-CN";
import { Locale, LocaleData } from "@repo/types/i18n";

export const i18nResources = {
  [Locale.EN]: en,
  [Locale.ZH_CN]: zhCN,
};

export const DEFAULT_LOCALE = Locale.EN;
export const DEFAULT_MESSAGES = en;

export const localeData: LocaleData = {
  [Locale.EN]: {
    flag: "🇺🇸",
    name: "English",
  },
  [Locale.ZH_CN]: {
    flag: "🇨🇳",
    name: "中文",
  },
};

export const isValidLocale = (locale: string): boolean => {
  return Object.values(Locale).includes(locale as Locale);
};

export const getLocale = (locale: string | undefined): Locale => {
  if (locale && isValidLocale(locale)) {
    return locale as Locale;
  }
  return DEFAULT_LOCALE;
};

export const removeLocaleFromUrl = (url: URL) => {
  const newPathname = "/" + url.pathname.split("/").slice(2).join("/");
  return new URL(newPathname + url.search, url.origin);
};

export { Locale } from "@repo/types/i18n";
