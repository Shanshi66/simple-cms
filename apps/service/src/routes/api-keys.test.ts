import { describe, it, expect, beforeEach } from "vitest";
import app from "./api-keys";
import { env } from "cloudflare:test";
import { createDb } from "@/db";
import { sites, apiKeys } from "@/db/schema/cms";
import { ErrorCode } from "@repo/types/error";
import { ApiResponse } from "@repo/types";
import { CreateApiKeyResponse } from "@/types/api";
import { errorHandler } from "@/error";

// Test data factories
function createTestSite(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    name: `Test Site ${crypto.randomUUID().substring(0, 8)}`,
    description: "Test site description",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("API Keys API", () => {
  beforeEach(async () => {
    // Clean up database before each test
    const db = createDb(env.DB);
    app.onError(errorHandler);
    await db.delete(apiKeys);
    await db.delete(sites);
  });

  describe("POST /sites/{siteId}/api-keys", () => {
    it("should create a new API key successfully", async () => {
      // First, create a test site
      const db = createDb(env.DB);
      const testSite = createTestSite();
      await db.insert(sites).values(testSite);

      const apiKeyData = {
        name: "Test API Key",
        expiresAt: "2024-12-31T23:59:59.000Z",
      };

      const res = await app.request(
        `/sites/${testSite.id}/api-keys`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: JSON.stringify(apiKeyData),
        },
        env,
      );

      expect(res.status).toBe(201);
      const responseData: ApiResponse<CreateApiKeyResponse> = await res.json();
      expect(responseData).toHaveProperty("success", true);
      expect(responseData).toHaveProperty("data");
      if (responseData.success) {
        const { data } = responseData;
        expect(data).toHaveProperty("id");
        expect(data.id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        ); // UUID format
        expect(data).toHaveProperty("apiKey");
        expect(data.apiKey).toMatch(/^sk_/); // Should start with sk_
        expect(data).toHaveProperty("name", apiKeyData.name);
        expect(data).toHaveProperty("siteId", testSite.id);
        expect(data).toHaveProperty("expiresAt", apiKeyData.expiresAt);
        expect(data).toHaveProperty("createdAt");
      }
    });

    it("should create an API key without expiration", async () => {
      // First, create a test site
      const db = createDb(env.DB);
      const testSite = createTestSite();
      await db.insert(sites).values(testSite);

      const apiKeyData = {
        name: "Test API Key No Expiry",
      };

      const res = await app.request(
        `/sites/${testSite.id}/api-keys`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: JSON.stringify(apiKeyData),
        },
        env,
      );

      expect(res.status).toBe(201);
      const responseData: ApiResponse<CreateApiKeyResponse> = await res.json();
      expect(responseData).toHaveProperty("success", true);
      expect(responseData).toHaveProperty("data");
      if (responseData.success) {
        const { data } = responseData;
        expect(data).toHaveProperty("expiresAt", null);
      }
    });

    it("should return site not found error for non-existent site", async () => {
      const nonExistentSiteId = crypto.randomUUID();
      const apiKeyData = {
        name: "Test API Key",
        expiresAt: "2024-12-31T23:59:59.000Z",
      };

      const res = await app.request(
        `/sites/${nonExistentSiteId}/api-keys`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: JSON.stringify(apiKeyData),
        },
        env,
      );

      expect(res.status).toBe(404);
      const responseData: ApiResponse<never> = await res.json();
      expect(responseData).toHaveProperty("success", false);
      expect(responseData).toHaveProperty("error");
      if (!responseData.success) {
        expect(responseData.error).toHaveProperty(
          "code",
          ErrorCode.SITE_NOT_FOUND,
        );
      }
    });

    it("should return validation error for missing API key name", async () => {
      // First, create a test site
      const db = createDb(env.DB);
      const testSite = createTestSite();
      await db.insert(sites).values(testSite);

      const apiKeyData = {
        expiresAt: "2024-12-31T23:59:59.000Z",
      };

      const res = await app.request(
        `/sites/${testSite.id}/api-keys`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: JSON.stringify(apiKeyData),
        },
        env,
      );

      expect(res.status).toBe(400);
      const responseData: ApiResponse<never> = await res.json();
      expect(responseData).toHaveProperty("success", false);
      expect(responseData).toHaveProperty("error");
    });

    it("should return validation error for empty API key name", async () => {
      // First, create a test site
      const db = createDb(env.DB);
      const testSite = createTestSite();
      await db.insert(sites).values(testSite);

      const apiKeyData = {
        name: "",
        expiresAt: "2024-12-31T23:59:59.000Z",
      };

      const res = await app.request(
        `/sites/${testSite.id}/api-keys`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: JSON.stringify(apiKeyData),
        },
        env,
      );

      expect(res.status).toBe(400);
      const responseData: ApiResponse<never> = await res.json();
      expect(responseData).toHaveProperty("success", false);
      expect(responseData).toHaveProperty("error");
    });

    it("should return validation error for invalid expiration date format", async () => {
      // First, create a test site
      const db = createDb(env.DB);
      const testSite = createTestSite();
      await db.insert(sites).values(testSite);

      const apiKeyData = {
        name: "Test API Key",
        expiresAt: "invalid-date",
      };

      const res = await app.request(
        `/sites/${testSite.id}/api-keys`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: JSON.stringify(apiKeyData),
        },
        env,
      );

      expect(res.status).toBe(400);
      const responseData: ApiResponse<never> = await res.json();
      expect(responseData).toHaveProperty("success", false);
      expect(responseData).toHaveProperty("error");
    });

    it("should return validation error for missing site ID", async () => {
      const apiKeyData = {
        name: "Test API Key",
      };

      const res = await app.request(
        `/sites//api-keys`, // Empty siteId
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: JSON.stringify(apiKeyData),
        },
        env,
      );

      expect(res.status).toBe(404); // Route not found for empty path segment
    });

    it("should return authentication error for missing admin key", async () => {
      const testSiteId = crypto.randomUUID();
      const apiKeyData = {
        name: "Test API Key",
      };

      const res = await app.request(
        `/sites/${testSiteId}/api-keys`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiKeyData),
        },
        env,
      );

      expect(res.status).toBe(401);
      const responseData: ApiResponse<never> = await res.json();
      expect(responseData).toHaveProperty("success", false);
      expect(responseData).toHaveProperty("error");
      if (!responseData.success) {
        expect(responseData.error).toHaveProperty(
          "code",
          ErrorCode.INVALID_ADMIN_KEY,
        );
      }
    });

    it("should return authentication error for invalid admin key", async () => {
      const testSiteId = crypto.randomUUID();
      const apiKeyData = {
        name: "Test API Key",
      };

      const res = await app.request(
        `/sites/${testSiteId}/api-keys`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer invalid-key",
          },
          body: JSON.stringify(apiKeyData),
        },
        env,
      );

      expect(res.status).toBe(401);
      const responseData: ApiResponse<never> = await res.json();
      expect(responseData).toHaveProperty("success", false);
      expect(responseData).toHaveProperty("error");
      if (!responseData.success) {
        expect(responseData.error).toHaveProperty(
          "code",
          ErrorCode.INVALID_ADMIN_KEY,
        );
      }
    });

    it("should generate unique API keys for multiple requests", async () => {
      // First, create a test site
      const db = createDb(env.DB);
      const testSite = createTestSite();
      await db.insert(sites).values(testSite);

      const apiKeyData1 = { name: "Test API Key 1" };
      const apiKeyData2 = { name: "Test API Key 2" };

      // Create first API key
      const res1 = await app.request(
        `/sites/${testSite.id}/api-keys`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: JSON.stringify(apiKeyData1),
        },
        env,
      );

      // Create second API key
      const res2 = await app.request(
        `/sites/${testSite.id}/api-keys`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: JSON.stringify(apiKeyData2),
        },
        env,
      );

      expect(res1.status).toBe(201);
      expect(res2.status).toBe(201);

      const responseData1: ApiResponse<CreateApiKeyResponse> =
        await res1.json();
      const responseData2: ApiResponse<CreateApiKeyResponse> =
        await res2.json();

      if (responseData1.success && responseData2.success) {
        const { data: data1 } = responseData1;
        const { data: data2 } = responseData2;
        // API keys should be different
        expect(data1.apiKey).not.toBe(data2.apiKey);
        // IDs should be different
        expect(data1.id).not.toBe(data2.id);
        // Both should start with "sk_"
        expect(data1.apiKey).toMatch(/^sk_/);
        expect(data2.apiKey).toMatch(/^sk_/);
      }
    });
  });
});
