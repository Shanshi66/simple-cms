import { describe, it, expect, beforeEach } from "vitest";
import { Hono } from "hono";
import articles from "./articles";
import { generateApiKey, hashApiKey } from "@/lib/crypto";
import { errorHandler } from "@/error";
import { CFBindings, MiddlewareVars } from "@/types/context";
import { ArticleStatus, Language } from "@/types/validation";
import { env } from "cloudflare:test";
import { createDb } from "@/db";
import {
  sites,
  apiKeys,
  articlesMetadata,
  articlesContent,
} from "@/db/schema/cms";
import { ErrorCode } from "@repo/types/errors";

describe("Articles Routes", () => {
  let app: Hono<{ Bindings: CFBindings; Variables: MiddlewareVars }>;
  let db: ReturnType<typeof createDb>;

  let testApiKey: string;
  let testApiKeyHash: string;
  const testSiteId = crypto.randomUUID();

  beforeEach(async () => {
    app = new Hono<{ Bindings: CFBindings; Variables: MiddlewareVars }>();

    // Set up error handler like in the main app
    app.onError(errorHandler);

    db = createDb(env.DB);

    // Generate real API key and hash for this test run
    testApiKey = generateApiKey();
    testApiKeyHash = await hashApiKey(testApiKey);

    // Clean up any existing test data (migrations ensure tables exist)
    await db.delete(articlesContent).run();
    await db.delete(articlesMetadata).run();
    await db.delete(apiKeys).run();
    await db.delete(sites).run();

    // Insert test site
    await db
      .insert(sites)
      .values({
        id: testSiteId,
        name: "Test Site",
        description: "Test site description",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .run();

    // Insert test API key with real hash
    await db
      .insert(apiKeys)
      .values({
        id: crypto.randomUUID(),
        siteId: testSiteId,
        keyHash: testApiKeyHash,
        name: "Test Key",
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .run();

    // Set up real Cloudflare environment for each request
    app.use("*", (c, next) => {
      c.env = env as unknown as CFBindings;
      return next();
    });

    app.route("/", articles);
  });

  describe("GET /sites/:site/articles", () => {
    it("should return paginated articles list", async () => {
      // Insert test article
      const articleId = crypto.randomUUID();
      await db
        .insert(articlesMetadata)
        .values({
          id: articleId,
          siteId: testSiteId,
          language: Language.EN,
          slug: "test-article-1",
          title: "Test Article 1",
          excerpt: "Test excerpt 1",
          date: "2025-09-06",
          status: ArticleStatus.PUBLISHED,
          createdAt: new Date("2025-09-06T10:00:00Z"),
          updatedAt: new Date("2025-09-06T10:00:00Z"),
        })
        .run();

      const res = await app.request(`/sites/${testSiteId}/articles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${testApiKey}`,
        },
      });

      expect(res.status).toBe(200);
      const responseBody = await res.json();
      // Basic structure checks without deep member access
      expect(responseBody).toHaveProperty("success", true);
      expect(responseBody).toHaveProperty("data");
    });

    it("should return 401 without authorization header", async () => {
      const res = await app.request("/sites/test-site/articles");

      expect(res.status).toBe(401);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty("error");
    });

    it("should return 403 for unauthorized site access", async () => {
      const res = await app.request("/sites/unauthorized-site/articles", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${testApiKey}`,
        },
      });

      expect(res.status).toBe(403);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty("error");
    });

    it("should return 403 for non-existent site", async () => {
      // Use a non-existent site ID - this should return 403 for security reasons
      const nonExistentSiteId = "non-existent-site";

      const res = await app.request(`/sites/${nonExistentSiteId}/articles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${testApiKey}`,
        },
      });

      expect(res.status).toBe(403);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty("error");
    });
  });

  describe("GET /sites/:site/articles/:lang/:slug", () => {
    let articleId: string;

    it("should return article detail with content", async () => {
      // Generate unique article ID for this test
      articleId = crypto.randomUUID();

      // Insert test article with content
      await db
        .insert(articlesMetadata)
        .values({
          id: articleId,
          siteId: testSiteId,
          language: Language.EN,
          slug: "test-article",
          title: "Test Article",
          excerpt: "Test excerpt",
          date: "2025-09-06",
          status: ArticleStatus.PUBLISHED,
          createdAt: new Date("2025-09-06T10:00:00Z"),
          updatedAt: new Date("2025-09-06T10:00:00Z"),
        })
        .run();

      await db
        .insert(articlesContent)
        .values({
          articleId: articleId,
          content: "# Test Article\n\nThis is test content.",
          updatedAt: new Date("2025-09-06T10:00:00Z"),
        })
        .run();

      const res = await app.request(
        `/sites/${testSiteId}/articles/en/test-article`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${testApiKey}`,
          },
        },
      );

      expect(res.status).toBe(200);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", true);
      expect(responseBody).toHaveProperty("data");
    });

    it("should return 404 for non-existent article", async () => {
      // Don't insert any article - test will use non-existent slug

      const res = await app.request(
        `/sites/${testSiteId}/articles/en/non-existent`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${testApiKey}`,
          },
        },
      );

      expect(res.status).toBe(404);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty("error");
      expect(responseBody).toHaveProperty(
        "error.code",
        ErrorCode.ARTICLE_NOT_FOUND,
      );
    });
  });

  describe("POST /sites/:site/articles", () => {
    const validArticleData = {
      language: Language.EN,
      slug: "test-article",
      title: "Test Article",
      excerpt: "Test excerpt",
      date: "2025-09-06",
      status: ArticleStatus.DRAFT,
      content: "# Test Article\n\nThis is test content.",
    };

    it("should create new article successfully", async () => {
      // No need to prepare data - the test will create a new article

      const res = await app.request(`/sites/${testSiteId}/articles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${testApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validArticleData),
      });

      expect(res.status).toBe(201);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", true);
      expect(responseBody).toHaveProperty("data");
    });

    it("should return 409 for duplicate slug", async () => {
      // Insert an existing article with the same slug
      await db
        .insert(articlesMetadata)
        .values({
          id: crypto.randomUUID(),
          siteId: testSiteId,
          language: Language.EN,
          slug: "test-article", // Same slug as in validArticleData
          title: "Existing Article",
          excerpt: "Existing excerpt",
          date: "2025-09-05",
          status: ArticleStatus.PUBLISHED,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .run();

      const res = await app.request(`/sites/${testSiteId}/articles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${testApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validArticleData),
      });

      expect(res.status).toBe(409);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty("error");
      expect(responseBody).toHaveProperty(
        "error.code",
        ErrorCode.ARTICLE_EXISTS,
      );
    });

    it("should validate required fields", async () => {
      const invalidData = {
        language: Language.EN,
        slug: "test-article",
        // Missing required title field
        excerpt: "Test excerpt",
        date: "2025-09-06",
        content: "# Test Article\n\nThis is test content.",
      };

      const res = await app.request(`/sites/${testSiteId}/articles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${testApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidData),
      });

      expect(res.status).toBe(400);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty("error");
    });
  });

  describe("Authentication", () => {
    it("should require valid API key for all endpoints", async () => {
      const endpoints = [
        { method: "GET", path: `/sites/${testSiteId}/articles` },
        { method: "GET", path: `/sites/${testSiteId}/articles/en/test` },
        { method: "POST", path: `/sites/${testSiteId}/articles` },
      ];

      for (const endpoint of endpoints) {
        const res = await app.request(endpoint.path, {
          method: endpoint.method,
          body: endpoint.method === "POST" ? JSON.stringify({}) : undefined,
        });

        expect(res.status).toBe(401);
        const responseBody = await res.json();
        expect(responseBody).toHaveProperty("success", false);
      }
    });
  });

  describe("CMS Error Codes", () => {
    it("should return ARTICLE_NOT_FOUND error code for missing articles", async () => {
      const res = await app.request(
        `/sites/${testSiteId}/articles/en/missing-article`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${testApiKey}`,
          },
        },
      );

      expect(res.status).toBe(404);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty("error");
      expect(responseBody).toHaveProperty(
        "error.code",
        ErrorCode.ARTICLE_NOT_FOUND,
      );
    });

    it("should return ARTICLE_EXISTS error code for duplicate slugs", async () => {
      // First, create an article
      const existingArticle = {
        language: Language.EN,
        slug: "duplicate-test",
        title: "Existing Article",
        excerpt: "Test excerpt",
        date: "2025-09-06",
        status: ArticleStatus.PUBLISHED,
        content: "Test content",
      };

      await app.request(`/sites/${testSiteId}/articles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${testApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(existingArticle),
      });

      // Try to create another article with the same slug
      const duplicateArticle = {
        ...existingArticle,
        title: "Duplicate Article",
      };

      const res = await app.request(`/sites/${testSiteId}/articles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${testApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(duplicateArticle),
      });

      expect(res.status).toBe(409);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty("error");
      expect(responseBody).toHaveProperty(
        "error.code",
        ErrorCode.ARTICLE_EXISTS,
      );
    });
  });
});
