import { z } from "zod";

// Article status enum
export const ArticleStatus = {
  DRAFT: "draft",
  PUBLISHED: "published",
} as const;

export type ArticleStatus = (typeof ArticleStatus)[keyof typeof ArticleStatus];

// Language enum
export const Language = {
  EN: "en",
  ZH_CN: "zh-CN",
} as const;

export type Language = (typeof Language)[keyof typeof Language];

// Query parameters validation for article list endpoint
export const articleListQuerySchema = z.object({
  lang: z.enum([Language.EN, Language.ZH_CN]).optional(),
  status: z.enum([ArticleStatus.DRAFT, ArticleStatus.PUBLISHED]).optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val >= 1, "Page must be >= 1"),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .refine((val) => val >= 1 && val <= 100, "Limit must be between 1 and 100"),
});

// Path parameters validation for article detail endpoint
export const articleDetailParamsSchema = z.object({
  site: z.string().min(1, "Site is required"),
  lang: z.enum([Language.EN, Language.ZH_CN]),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
});

// Path parameters validation for site in article creation
export const articleSiteParamSchema = z.object({
  site: z.string().min(1, "Site is required"),
});

// Request body validation for article creation
export const createArticleSchema = z.object({
  language: z.enum([Language.EN, Language.ZH_CN]),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  status: z
    .enum([ArticleStatus.DRAFT, ArticleStatus.PUBLISHED])
    .default(ArticleStatus.DRAFT),
  content: z.string().min(1, "Content is required"),
});

export type ArticleListQuery = z.infer<typeof articleListQuerySchema>;
export type ArticleDetailParams = z.infer<typeof articleDetailParamsSchema>;
export type ArticleSiteParam = z.infer<typeof articleSiteParamSchema>;
export type CreateArticleBody = z.infer<typeof createArticleSchema>;
