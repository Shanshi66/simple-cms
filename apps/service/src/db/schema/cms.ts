import { ArticleStatus } from "@repo/types/api";
import { Language } from "@repo/types/i18n";
import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const sites = sqliteTable("sites", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const apiKeys = sqliteTable("api_keys", {
  id: text("id").primaryKey(),
  siteId: text("site_id")
    .notNull()
    .references(() => sites.id),
  keyHash: text("key_hash").notNull().unique(),
  name: text("name").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const articlesMetadata = sqliteTable(
  "articles_metadata",
  {
    id: text("id").primaryKey(),
    siteId: text("site_id")
      .notNull()
      .references(() => sites.id),
    language: text("language", {
      enum: [Language.EN, Language.ZH_CN],
    }).notNull(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    date: text("date").notNull(),
    status: text("status", {
      enum: [ArticleStatus.DRAFT, ArticleStatus.PUBLISHED],
    })
      .notNull()
      .default(ArticleStatus.DRAFT),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_articles_site_lang_slug").on(
      table.siteId,
      table.language,
      table.slug,
    ),
  ],
);

export const articlesContent = sqliteTable("articles_content", {
  articleId: text("article_id")
    .primaryKey()
    .references(() => articlesMetadata.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});
