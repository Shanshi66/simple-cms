import { describe, it, expect, beforeEach } from "vitest";
import app from "./articles";
import { generateApiKey, hashApiKey } from "@/lib/crypto";
import { ArticleStatus } from "@repo/types/api";
import { Language } from "@repo/types/i18n";
import { env } from "cloudflare:test";
import { createDb, D1DB } from "@/db";
import {
  sites,
  apiKeys,
  articlesMetadata,
  articlesContent,
} from "@/db/schema/cms";
import { ErrorCode } from "@repo/types/error";
import { errorHandler } from "@/error";

// Test data factories
function createTestSite() {
  return {
    id: crypto.randomUUID(),
    name: "test-site",
    description: "Test site description",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function createTestApiKey(siteId: string, keyHash: string) {
  return {
    id: crypto.randomUUID(),
    siteId,
    keyHash,
    name: "Test Key",
    expiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

interface TestArticleOptions {
  id?: string;
  language?: Language;
  slug?: string;
  title?: string;
  excerpt?: string;
  date?: string;
  status?: ArticleStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

function createTestArticle(siteId: string, overrides: TestArticleOptions = {}) {
  return {
    id: crypto.randomUUID(),
    siteId,
    language: Language.EN,
    slug: "test-article",
    title: "Test Article",
    excerpt: "Test excerpt",
    date: "2025-09-06",
    status: ArticleStatus.PUBLISHED,
    createdAt: new Date("2025-09-06T10:00:00Z"),
    updatedAt: new Date("2025-09-06T10:00:00Z"),
    ...overrides,
  };
}

describe("Articles Routes", () => {
  let testApiKey: string;
  let testApiKeyHash: string;
  let testSiteId: string;
  let testSiteName: string;
  let db: D1DB;

  beforeEach(async () => {
    // Generate test credentials
    testApiKey = generateApiKey();
    testApiKeyHash = await hashApiKey(testApiKey);
    testSiteId = crypto.randomUUID();
    testSiteName = "test-site";

    db = createDb(env.DB);
    app.onError(errorHandler);

    // Clean up test data for isolation
    await db.delete(articlesContent).run();
    await db.delete(articlesMetadata).run();
    await db.delete(apiKeys).run();
    await db.delete(sites).run();

    // Setup test data using factories
    const testSite = {
      ...createTestSite(),
      id: testSiteId,
      name: testSiteName,
    };
    await db.insert(sites).values(testSite).run();

    const testKey = createTestApiKey(testSiteId, testApiKeyHash);
    await db.insert(apiKeys).values(testKey).run();
  });

  describe("GET /sites/:name/articles", () => {
    it("should return paginated articles list", async () => {
      // Insert test article using factory
      const testArticle = createTestArticle(testSiteId, {
        slug: "test-article-1",
        title: "Test Article 1",
        excerpt: "Test excerpt 1",
      });
      await db.insert(articlesMetadata).values(testArticle).run();

      const res = await app.request(
        `/sites/${testSiteName}/articles`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${testApiKey}`,
          },
        },
        env,
      );

      expect(res.status).toBe(200);
      const responseBody = await res.json();
      // Basic structure checks without deep member access
      expect(responseBody).toHaveProperty("success", true);
      expect(responseBody).toHaveProperty("data");
    });

    it("should return 401 without authorization header", async () => {
      const res = await app.request(`/sites/${testSiteName}/articles`, {}, env);

      expect(res.status).toBe(401);
    });

    it("should return 403 for unauthorized site access", async () => {
      const res = await app.request(
        "/sites/unauthorized-site/articles",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${testApiKey}`,
          },
        },
        env,
      );

      expect(res.status).toBe(403);
    });

    it("should return 403 for non-existent site", async () => {
      // Use a non-existent site name - this should return 403 for security reasons
      const nonExistentSiteName = "non-existent-site";

      const res = await app.request(
        `/sites/${nonExistentSiteName}/articles`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${testApiKey}`,
          },
        },
        env,
      );

      expect(res.status).toBe(403);
    });
  });

  describe("GET /sites/:name/articles/:lang/:slug", () => {
    it("should return article detail with content", async () => {
      // Insert test article with content using factory
      const testArticle = createTestArticle(testSiteId);
      await db.insert(articlesMetadata).values(testArticle).run();

      await db
        .insert(articlesContent)
        .values({
          articleId: testArticle.id,
          content: "# Test Article\n\nThis is test content.",
          updatedAt: new Date("2025-09-06T10:00:00Z"),
        })
        .run();

      const res = await app.request(
        `/sites/${testSiteName}/articles/en/test-article`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${testApiKey}`,
          },
        },
        env,
      );

      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent article", async () => {
      // Don't insert any article - test will use non-existent slug

      const res = await app.request(
        `/sites/${testSiteName}/articles/en/non-existent`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${testApiKey}`,
          },
        },
        env,
      );
      expect(res.status).toBe(404);
    });
  });

  describe("POST /sites/:name/articles", () => {
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

      const res = await app.request(
        `/sites/${testSiteName}/articles`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${testApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validArticleData),
        },
        env,
      );

      expect(res.status).toBe(201);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", true);
      expect(responseBody).toHaveProperty("data");
    });

    it("should return 409 for duplicate slug", async () => {
      // Insert an existing article with the same slug using factory
      const existingArticle = createTestArticle(testSiteId, {
        slug: "test-article", // Same slug as in validArticleData
        title: "Existing Article",
        excerpt: "Existing excerpt",
        date: "2025-09-05",
        status: ArticleStatus.PUBLISHED,
      });
      await db.insert(articlesMetadata).values(existingArticle).run();

      const res = await app.request(
        `/sites/${testSiteName}/articles`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${testApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validArticleData),
        },
        env,
      );

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

      const res = await app.request(
        `/sites/${testSiteName}/articles`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${testApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invalidData),
        },
        env,
      );

      expect(res.status).toBe(400);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty("error");
    });
  });

  describe("Authentication", () => {
    it("should require valid API key for all endpoints", async () => {
      const endpoints = [
        { method: "GET", path: `/sites/${testSiteName}/articles` },
        { method: "GET", path: `/sites/${testSiteName}/articles/en/test` },
        { method: "POST", path: `/sites/${testSiteName}/articles` },
      ];

      for (const endpoint of endpoints) {
        const res = await app.request(
          endpoint.path,
          {
            method: endpoint.method,
            body: endpoint.method === "POST" ? JSON.stringify({}) : undefined,
          },
          env,
        );

        expect(res.status).toBe(401);
        const responseBody = await res.json();
        expect(responseBody).toHaveProperty("success", false);
      }
    });
  });

  describe("CMS Error Codes", () => {
    it("should return ARTICLE_NOT_FOUND error code for missing articles", async () => {
      const res = await app.request(
        `/sites/${testSiteName}/articles/en/missing-article`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${testApiKey}`,
          },
        },
        env,
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
      // Insert existing article directly using factory for faster setup
      const existingArticle = createTestArticle(testSiteId, {
        slug: "duplicate-test",
        title: "Existing Article",
      });
      await db.insert(articlesMetadata).values(existingArticle).run();

      // Try to create another article with the same slug via API
      const duplicateArticle = {
        language: Language.EN,
        slug: "duplicate-test", // Same slug
        title: "Duplicate Article",
        excerpt: "Test excerpt",
        date: "2025-09-06",
        status: ArticleStatus.PUBLISHED,
        content: "Test content",
      };

      const res = await app.request(
        `/sites/${testSiteName}/articles`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${testApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(duplicateArticle),
        },
        env,
      );

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
