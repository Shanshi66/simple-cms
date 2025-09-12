import { ArticleMetadataInput, Language } from "@repo/types/api";

// Frontend-specific article data structure
export interface ArticleData {
  metadata: ArticleMetadataInput;
  content: string;
  language: Language;
}

// Frontend-specific site configuration
export interface SiteConfig {
  id: string;
  apiKey: string;
}

// R2 configuration interface
export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  endpoint: string;
}

// Parse result interface
export interface ParseResult {
  metadata: ArticleMetadataInput;
  content: string;
}
