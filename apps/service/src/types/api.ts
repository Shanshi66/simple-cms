// Article API Types
import type {
  ArticleStatus,
  CreateArticleRequest,
  CreateArticleResponse,
} from "@repo/types/api";
import type { Language } from "@repo/types/i18n";

// Re-export shared types for backward compatibility
export type {
  ArticleStatus,
  Language,
  CreateArticleRequest,
  CreateArticleResponse,
};

export interface ArticleListQueryParams {
  lang?: Language;
  status?: ArticleStatus;
  page?: number;
  limit?: number;
}

export interface ArticleDetailPathParams {
  site: string;
  lang: Language;
  slug: string;
}

export interface ArticleMetadata {
  id: string;
  site_id: string;
  language: Language;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  status: ArticleStatus;
  created_at: string;
  updated_at: string;
}

export interface ArticleDetail extends ArticleMetadata {
  content: string;
}

export interface ArticleListResponse {
  articles: ArticleMetadata[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Site API Types
export interface Site {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteListResponse {
  sites: Site[];
}

export interface CreateSiteResponse {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// API Key API Types
export interface ApiKey {
  id: string;
  name: string;
  siteId: string;
  expiresAt: string | null;
  createdAt: string;
}

export interface CreateApiKeyResponse {
  id: string;
  apiKey: string;
  name: string;
  siteId: string;
  expiresAt: string | null;
  createdAt: string;
}
