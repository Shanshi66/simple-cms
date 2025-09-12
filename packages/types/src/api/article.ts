import { z } from "zod";

// Base enums for CMS
export const ArticleStatus = {
  DRAFT: "draft",
  PUBLISHED: "published",
} as const;

export type ArticleStatus = (typeof ArticleStatus)[keyof typeof ArticleStatus];

export const Language = {
  EN: "en",
  ZH_CN: "zh-CN",
} as const;

export type Language = (typeof Language)[keyof typeof Language];

// Validation constants
export const SLUG_REGEX = /^[a-z0-9-]+$/;
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Zod schemas for validation and type generation
export const ArticleMetadataSchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  date: z.string().regex(DATE_REGEX, "Date must be in YYYY-MM-DD format"),
  status: z.enum([ArticleStatus.DRAFT, ArticleStatus.PUBLISHED]),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      SLUG_REGEX,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
});

export const CreateArticleRequestSchema = z.object({
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

export const CreateArticleResponseSchema = z.object({
  id: z.string(),
  message: z.string(),
});

// Types inferred from schemas
export type ArticleMetadataInput = z.infer<typeof ArticleMetadataSchema>;
export type CreateArticleRequest = z.infer<typeof CreateArticleRequestSchema>;
export type CreateArticleResponse = z.infer<typeof CreateArticleResponseSchema>;
