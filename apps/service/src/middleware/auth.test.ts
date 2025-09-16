import { describe, it, expect, beforeEach } from "vitest";
import { Hono } from "hono";
import { apiAuth } from "./auth";
import { errorHandler } from "@/error";
import { CFBindings, MiddlewareVars } from "@/types/context";
import { ErrorCode } from "@repo/types/error";
import { env } from "cloudflare:test";
import { createDb } from "@/db";
import { sites, apiKeys } from "@/db/schema/cms";
import { generateApiKey, hashApiKey } from "@/lib/crypto";

// Test data factories
function createTestSite(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    name: `test-site-${crypto.randomUUID().substring(0, 8)}`,
    description: "Test site description",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createTestApiKey(siteId: string, overrides = {}) {
  return {
    id: crypto.randomUUID(),
    siteId,
    name: "Test API Key",
    keyHash: "default-key-hash", // Default hash, can be overridden
    expiresAt: null, // No expiration by default
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("API Authentication Middleware", () => {
  let app: Hono<{ Bindings: CFBindings; Variables: MiddlewareVars }>;
  let testSite: ReturnType<typeof createTestSite>;
  let validApiKey: string;
  let validApiKeyHash: string;

  beforeEach(async () => {
    app = new Hono<{ Bindings: CFBindings; Variables: MiddlewareVars }>();

    // Set up error handler like in the main app
    app.onError(errorHandler);

    // Apply api auth middleware to test route
    app.use("*", apiAuth());

    // Add test route that requires API auth and returns the siteName from context
    app.get("/test", (c) => {
      const siteName = c.get("siteName");
      return c.json({ message: "API access granted", siteName });
    });

    // Clean up database and set up test data
    const db = createDb(env.DB);
    await db.delete(apiKeys);
    await db.delete(sites);

    // Create test site
    testSite = createTestSite();
    await db.insert(sites).values(testSite);

    // Create valid API key
    validApiKey = generateApiKey();
    validApiKeyHash = await hashApiKey(validApiKey);
    const testApiKeyData = createTestApiKey(testSite.id, {
      keyHash: validApiKeyHash,
    });
    await db.insert(apiKeys).values(testApiKeyData);
  });

  describe("Valid Authentication", () => {
    it("should allow access with valid API key and set siteName in context", async () => {
      const res = await app.request(
        "/test",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${validApiKey}`,
          },
        },
        env,
      );

      expect(res.status).toBe(200);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("message", "API access granted");
      expect(responseBody).toHaveProperty("siteName", testSite.name);
    });

    it("should handle Bearer token with extra spaces", async () => {
      const res = await app.request(
        "/test",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer  ${validApiKey}  `,
          },
        },
        env,
      );

      expect(res.status).toBe(200);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("siteName", testSite.name);
    });
  });

  describe("Missing Authorization", () => {
    it("should return 401 when Authorization header is missing", async () => {
      const res = await app.request(
        "/test",
        {
          method: "GET",
        },
        env,
      );

      expect(res.status).toBe(401);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty(
        "error.code",
        ErrorCode.INVALID_API_KEY,
      );
      expect(responseBody).toHaveProperty(
        "error.message",
        "Missing Authorization header",
      );
    });

    it("should return 401 when Authorization header is empty", async () => {
      const res = await app.request(
        "/test",
        {
          method: "GET",
          headers: {
            Authorization: "",
          },
        },
        env,
      );

      expect(res.status).toBe(401);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty(
        "error.code",
        ErrorCode.INVALID_API_KEY,
      );
    });
  });

  describe("Invalid Authorization Format", () => {
    it("should return 401 when Authorization header lacks Bearer prefix", async () => {
      const res = await app.request(
        "/test",
        {
          method: "GET",
          headers: {
            Authorization: validApiKey,
          },
        },
        env,
      );

      expect(res.status).toBe(401);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty(
        "error.code",
        ErrorCode.INVALID_API_KEY,
      );
      expect(responseBody).toHaveProperty("error.message");
      const responseString = JSON.stringify(responseBody);
      expect(
        responseString.includes("Invalid Authorization header format"),
      ).toBe(true);
    });

    it("should return 401 when Bearer token is empty", async () => {
      const res = await app.request(
        "/test",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer",
          },
        },
        env,
      );

      expect(res.status).toBe(401);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty(
        "error.code",
        ErrorCode.INVALID_API_KEY,
      );
    });

    it("should return 401 when Bearer token is only spaces", async () => {
      const res = await app.request(
        "/test",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer   ",
          },
        },
        env,
      );

      expect(res.status).toBe(401);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty(
        "error.code",
        ErrorCode.INVALID_API_KEY,
      );
    });
  });

  describe("Invalid API Key", () => {
    it("should return 401 when API key is incorrect", async () => {
      const res = await app.request(
        "/test",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer sk_wrong_api_key_12345",
          },
        },
        env,
      );

      expect(res.status).toBe(401);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty(
        "error.code",
        ErrorCode.INVALID_API_KEY,
      );
      expect(responseBody).toHaveProperty("error.message", "Invalid API key");
    });

    it("should return 401 when API key does not exist in database", async () => {
      const nonExistentApiKey = generateApiKey();
      const res = await app.request(
        "/test",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${nonExistentApiKey}`,
          },
        },
        env,
      );

      expect(res.status).toBe(401);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty(
        "error.code",
        ErrorCode.INVALID_API_KEY,
      );
      expect(responseBody).toHaveProperty("error.message", "Invalid API key");
    });
  });

  describe("Expired API Key", () => {
    it("should return 401 when API key is expired", async () => {
      // Create an expired API key
      const expiredApiKey = generateApiKey();
      const expiredApiKeyHash = await hashApiKey(expiredApiKey);
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1); // Yesterday

      const expiredApiKeyData = createTestApiKey(testSite.id, {
        keyHash: expiredApiKeyHash,
        expiresAt: expiredDate,
      });

      const db = createDb(env.DB);
      await db.insert(apiKeys).values(expiredApiKeyData);

      const res = await app.request(
        "/test",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${expiredApiKey}`,
          },
        },
        env,
      );

      expect(res.status).toBe(401);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty(
        "error.code",
        ErrorCode.INVALID_API_KEY,
      );
      expect(responseBody).toHaveProperty(
        "error.message",
        "API key has expired",
      );
    });
  });

  describe("Different HTTP Methods", () => {
    beforeEach(() => {
      app.post("/test", (c) => {
        const siteName = c.get("siteName");
        return c.json({ method: "POST", siteName });
      });
      app.put("/test", (c) => {
        const siteName = c.get("siteName");
        return c.json({ method: "PUT", siteName });
      });
      app.delete("/test", (c) => {
        const siteName = c.get("siteName");
        return c.json({ method: "DELETE", siteName });
      });
    });

    it("should work with POST requests", async () => {
      const res = await app.request(
        "/test",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${validApiKey}`,
          },
        },
        env,
      );

      expect(res.status).toBe(200);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("method", "POST");
      expect(responseBody).toHaveProperty("siteName", testSite.name);
    });

    it("should work with PUT requests", async () => {
      const res = await app.request(
        "/test",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${validApiKey}`,
          },
        },
        env,
      );

      expect(res.status).toBe(200);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("method", "PUT");
      expect(responseBody).toHaveProperty("siteName", testSite.name);
    });

    it("should work with DELETE requests", async () => {
      const res = await app.request(
        "/test",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${validApiKey}`,
          },
        },
        env,
      );

      expect(res.status).toBe(200);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("method", "DELETE");
      expect(responseBody).toHaveProperty("siteName", testSite.name);
    });
  });
});
