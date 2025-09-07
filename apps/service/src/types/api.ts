// Article API Types
import type { ArticleStatus, Language } from "./validation";

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

export interface CreateArticleRequest {
  language: Language;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  status?: ArticleStatus;
  content: string;
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

export interface CreateArticleResponse {
  id: string;
  message: string;
}
