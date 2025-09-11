import { z } from "zod";
import {
  ArticleStatus,
  Language,
  SLUG_REGEX,
  DATE_REGEX,
} from "@repo/types/cms";

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
      SLUG_REGEX,
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
      SLUG_REGEX,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  date: z.string().regex(DATE_REGEX, "Date must be in YYYY-MM-DD format"),
  status: z
    .enum([ArticleStatus.DRAFT, ArticleStatus.PUBLISHED])
    .default(ArticleStatus.DRAFT),
  content: z.string().min(1, "Content is required"),
});

// Form data validation for image upload endpoint
export const imageUploadFormSchema = z.object({
  siteId: z.string().min(1, "Site ID is required"),
  postSlug: z.string().min(1, "Post slug is required"),
});

export type ArticleListQuery = z.infer<typeof articleListQuerySchema>;
export type ArticleDetailParams = z.infer<typeof articleDetailParamsSchema>;
export type ArticleSiteParam = z.infer<typeof articleSiteParamSchema>;
export type CreateArticleBody = z.infer<typeof createArticleSchema>;
export type ImageUploadForm = z.infer<typeof imageUploadFormSchema>;
