export enum Locale {
  EN = "en",
  ZH_CN = "zh-CN",
}

export interface LocaleInfo {
  flag: string;
  name: string;
}

export type LocaleData = Record<Locale, LocaleInfo>;
