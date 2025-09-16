import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, and, desc, count } from "drizzle-orm";
import { ErrorCode } from "@repo/types/error";
import { CustomHttpException } from "@/error";
import { createDb } from "@/db";
import { articlesMetadata, articlesContent, sites } from "@/db/schema/cms";
import { createSuccessResponse } from "@/lib/utils";
import { apiAuth } from "@/middleware/auth";
import { CFBindings, MiddlewareVars } from "@/types/context";
import { D1DB } from "@/db";
import {
  articleListQuerySchema,
  articleDetailParamsSchema,
  siteNameParamSchema,
  createArticleSchema,
} from "@/types/validation";
import { ArticleStatus } from "@repo/types/api";
import {
  ArticleListResponse,
  ArticleDetail,
  CreateArticleResponse,
} from "@/types/api";

const router = new Hono<{ Bindings: CFBindings; Variables: MiddlewareVars }>();

// Helper function to get site ID from site name
async function getSiteIdFromName(db: D1DB, siteName: string): Promise<string> {
  const site = await db
    .select({ id: sites.id })
    .from(sites)
    .where(eq(sites.name, siteName))
    .get();

  if (!site) {
    throw new CustomHttpException(ErrorCode.SITE_NOT_FOUND, {
      message: "Site not found",
    });
  }

  return site.id;
}

// GET /sites/{name}/articles - Get articles list with pagination
router.get(
  "/sites/:name/articles",
  apiAuth(),
  zValidator("param", siteNameParamSchema),
  zValidator("query", articleListQuerySchema),
  async (c) => {
    const { name } = c.req.valid("param");
    const { lang, status, page, limit } = c.req.valid("query");
    const siteName = c.var.siteName;

    // Verify URL site name parameter matches authenticated site
    if (name !== siteName) {
      throw new CustomHttpException(ErrorCode.INSUFFICIENT_PERMISSIONS, {
        message: "Access denied: insufficient permissions for this site",
      });
    }

    const db = createDb(c.env.DB);

    // Get site ID from site name for database queries
    const siteId = await getSiteIdFromName(db, siteName);

    // Build query conditions
    const conditions = [eq(articlesMetadata.siteId, siteId)];

    if (lang) {
      conditions.push(eq(articlesMetadata.language, lang));
    }

    if (status) {
      conditions.push(eq(articlesMetadata.status, status));
    } else {
      // Default to published articles when status is not specified
      conditions.push(eq(articlesMetadata.status, ArticleStatus.PUBLISHED));
    }

    // Get total count for pagination
    const totalResult = await db
      .select({ count: count() })
      .from(articlesMetadata)
      .where(and(...conditions))
      .get();

    const total = totalResult?.count ?? 0;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // Get articles with pagination
    const articles = await db
      .select({
        id: articlesMetadata.id,
        site_id: articlesMetadata.siteId,
        language: articlesMetadata.language,
        slug: articlesMetadata.slug,
        title: articlesMetadata.title,
        excerpt: articlesMetadata.excerpt,
        date: articlesMetadata.date,
        status: articlesMetadata.status,
        created_at: articlesMetadata.createdAt,
        updated_at: articlesMetadata.updatedAt,
      })
      .from(articlesMetadata)
      .where(and(...conditions))
      .orderBy(desc(articlesMetadata.date))
      .limit(limit)
      .offset(offset);

    const response: ArticleListResponse = {
      articles: articles.map((article) => ({
        ...article,
        created_at: new Date(article.created_at).toISOString(),
        updated_at: new Date(article.updated_at).toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    };

    return c.json(createSuccessResponse(response));
  },
);

// GET /sites/{name}/articles/{lang}/{slug} - Get article detail
router.get(
  "/sites/:name/articles/:lang/:slug",
  apiAuth(),
  zValidator("param", articleDetailParamsSchema),
  async (c) => {
    const { name, lang, slug } = c.req.valid("param");
    const siteName = c.var.siteName;

    // Verify URL site name parameter matches authenticated site
    if (name !== siteName) {
      throw new CustomHttpException(ErrorCode.INSUFFICIENT_PERMISSIONS, {
        message: "Access denied: insufficient permissions for this site",
      });
    }

    const db = createDb(c.env.DB);

    // Get site ID from site name for database queries
    const siteId = await getSiteIdFromName(db, siteName);

    // First, get article metadata
    const articleMeta = await db
      .select({
        id: articlesMetadata.id,
        site_id: articlesMetadata.siteId,
        language: articlesMetadata.language,
        slug: articlesMetadata.slug,
        title: articlesMetadata.title,
        excerpt: articlesMetadata.excerpt,
        date: articlesMetadata.date,
        status: articlesMetadata.status,
        created_at: articlesMetadata.createdAt,
        updated_at: articlesMetadata.updatedAt,
      })
      .from(articlesMetadata)
      .where(
        and(
          eq(articlesMetadata.siteId, siteId),
          eq(articlesMetadata.language, lang),
          eq(articlesMetadata.slug, slug),
        ),
      )
      .get();

    if (!articleMeta) {
      throw new CustomHttpException(ErrorCode.ARTICLE_NOT_FOUND, {
        message: "Article not found",
      });
    }

    // Then get content using the articleId
    const articleContent = await db
      .select({ content: articlesContent.content })
      .from(articlesContent)
      .where(eq(articlesContent.articleId, articleMeta.id))
      .get();

    // Format timestamps for response
    const response: ArticleDetail = {
      ...articleMeta,
      content: articleContent?.content ?? "",
      created_at: new Date(articleMeta.created_at).toISOString(),
      updated_at: new Date(articleMeta.updated_at).toISOString(),
    };

    return c.json(createSuccessResponse(response));
  },
);

// POST /sites/{name}/articles - Create new article
router.post(
  "/sites/:name/articles",
  apiAuth(),
  zValidator("param", siteNameParamSchema),
  zValidator("json", createArticleSchema),
  async (c) => {
    const { name } = c.req.valid("param");
    const { language, slug, title, excerpt, date, status, content } =
      c.req.valid("json");
    const siteName = c.var.siteName;

    // Verify URL site name parameter matches authenticated site
    if (name !== siteName) {
      throw new CustomHttpException(ErrorCode.INSUFFICIENT_PERMISSIONS, {
        message: "Access denied: insufficient permissions for this site",
      });
    }

    const db = createDb(c.env.DB);

    // Get site ID from site name for database queries
    const siteId = await getSiteIdFromName(db, siteName);

    // Check if article with same slug already exists
    const existingArticle = await db
      .select({ id: articlesMetadata.id })
      .from(articlesMetadata)
      .where(
        and(
          eq(articlesMetadata.siteId, siteId),
          eq(articlesMetadata.language, language),
          eq(articlesMetadata.slug, slug),
        ),
      )
      .get();

    if (existingArticle) {
      throw new CustomHttpException(ErrorCode.ARTICLE_EXISTS, {
        message: "An article with this slug already exists for this language",
      });
    }

    // Generate article ID
    const articleId = crypto.randomUUID();
    const now = new Date();

    // Insert article metadata
    await db.insert(articlesMetadata).values({
      id: articleId,
      siteId,
      language,
      slug,
      title,
      excerpt,
      date,
      status,
      createdAt: now,
      updatedAt: now,
    });

    // Insert article content
    await db.insert(articlesContent).values({
      articleId,
      content,
      updatedAt: now,
    });

    const response: CreateArticleResponse = {
      id: articleId,
      message: "Article created successfully",
    };

    return c.json(createSuccessResponse(response), 201);
  },
);

export default router;
