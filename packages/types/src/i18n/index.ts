export const Language = {
  EN: "en",
  ZH_CN: "zh-CN",
} as const;

export type Language = (typeof Language)[keyof typeof Language];
