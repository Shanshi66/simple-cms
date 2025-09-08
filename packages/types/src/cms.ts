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

// API request/response types
export interface CreateArticleRequest {
  language: Language;
  slug: string;
  title: string;
  excerpt: string;
  date: string; // YYYY-MM-DD format
  status?: ArticleStatus;
  content: string;
}

export interface CreateArticleResponse {
  id: string;
  message: string;
}

// Frontend-specific metadata type (without database-specific fields)
export interface ArticleMetadataInput {
  title: string;
  excerpt: string;
  date: string; // YYYY-MM-DD format
  status: ArticleStatus;
  slug?: string; // URL identifier, optional (can be generated from filename)
}

// Validation constants
export const SLUG_REGEX = /^[a-z0-9-]+$/;
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
