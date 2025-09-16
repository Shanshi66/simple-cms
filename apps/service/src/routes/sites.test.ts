import { describe, it, expect, beforeEach } from "vitest";
import app from "./sites";
import { env } from "cloudflare:test";
import { createDb } from "@/db";
import { sites } from "@/db/schema/cms";
import { ErrorCode } from "@repo/types/error";
import { ApiResponse } from "@repo/types";
import { CreateSiteResponse, SiteListResponse } from "@/types/api";
import { errorHandler } from "@/error";

// Test data factories
function createTestSite(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    name: `test-site-${crypto.randomUUID().substring(0, 8)}`, // Unique name
    description: "Test site description",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("Sites API", () => {
  beforeEach(async () => {
    // Clean up sites table before each test
    const db = createDb(env.DB);
    app.onError(errorHandler);
    await db.delete(sites);
  });

  describe("POST /sites", () => {
    it("should create a new site successfully", async () => {
      const siteData = {
        name: "test-site",
        description: "A test site",
      };

      const res = await app.request(
        "/sites",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: JSON.stringify(siteData),
        },
        env,
      );

      expect(res.status).toBe(201);
      const responseData: ApiResponse<CreateSiteResponse> = await res.json();
      expect(responseData).toHaveProperty("success", true);
      expect(responseData).toHaveProperty("data");
      if (responseData.success) {
        expect(responseData.data).toHaveProperty("id");
        expect(responseData.data.id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        ); // UUID format
        expect(responseData.data).toHaveProperty("name", siteData.name);
        expect(responseData.data).toHaveProperty(
          "description",
          siteData.description,
        );
        expect(responseData.data).toHaveProperty("created_at");
        expect(responseData.data).toHaveProperty("updated_at");
      }
    });

    it("should create a site without description", async () => {
      const siteData = {
        name: "test-site-without-description",
      };

      const res = await app.request(
        "/sites",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: JSON.stringify(siteData),
        },
        env,
      );

      expect(res.status).toBe(201);
      const responseData: ApiResponse<CreateSiteResponse> = await res.json();
      expect(responseData).toHaveProperty("success", true);
      expect(responseData).toHaveProperty("data");
      if (responseData.success) {
        expect(responseData.data).toHaveProperty("description", null);
      }
    });

    it("should return validation error for missing site name", async () => {
      const siteData = {
        description: "A test site without name",
      };

      const res = await app.request(
        "/sites",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: JSON.stringify(siteData),
        },
        env,
      );

      expect(res.status).toBe(400);
      const responseData: ApiResponse<never> = await res.json();
      expect(responseData).toHaveProperty("success", false);
      expect(responseData).toHaveProperty("error");
    });

    it("should return validation error for empty site name", async () => {
      const siteData = {
        name: "",
        description: "A test site",
      };

      const res = await app.request(
        "/sites",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: JSON.stringify(siteData),
        },
        env,
      );

      expect(res.status).toBe(400);
      const responseData: ApiResponse<never> = await res.json();
      expect(responseData).toHaveProperty("success", false);
      expect(responseData).toHaveProperty("error");
    });

    it("should return conflict error for duplicate site name", async () => {
      // First, create a site
      const db = createDb(env.DB);
      const existingSite = createTestSite();
      await db.insert(sites).values(existingSite);

      // Try to create another site with the same name
      const siteData = {
        name: existingSite.name,
        description: "This should fail due to duplicate name",
      };

      const res = await app.request(
        "/sites",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: JSON.stringify(siteData),
        },
        env,
      );

      expect(res.status).toBe(409);
      const responseData: ApiResponse<never> = await res.json();
      expect(responseData).toHaveProperty("success", false);
      expect(responseData).toHaveProperty("error");
      if (!responseData.success) {
        expect(responseData.error).toHaveProperty(
          "code",
          ErrorCode.SITE_EXISTS,
        );
      }
    });

    it("should return authentication error for missing admin key", async () => {
      const siteData = {
        name: "test-site-auth",
        description: "A test site",
      };

      const res = await app.request(
        "/sites",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(siteData),
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
      const siteData = {
        name: "test-site-invalid",
        description: "A test site",
      };

      const res = await app.request(
        "/sites",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer invalid-key",
          },
          body: JSON.stringify(siteData),
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
  });

  describe("GET /sites", () => {
    it("should return empty list when no sites exist", async () => {
      const res = await app.request(
        "/sites",
        {
          headers: {
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
        },
        env,
      );

      expect(res.status).toBe(200);
      const responseData: ApiResponse<SiteListResponse> = await res.json();
      expect(responseData).toHaveProperty("success", true);
      expect(responseData).toHaveProperty("data");
      if (responseData.success) {
        expect(responseData.data.sites).toEqual([]);
      }
    });

    it("should return list of sites", async () => {
      // Create test sites
      const db = createDb(env.DB);
      const site1 = createTestSite();
      const site2 = createTestSite();

      await db.insert(sites).values([site1, site2]);

      const res = await app.request(
        "/sites",
        {
          headers: {
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
        },
        env,
      );

      expect(res.status).toBe(200);
      const responseData: ApiResponse<SiteListResponse> = await res.json();
      expect(responseData).toHaveProperty("success", true);
      expect(responseData).toHaveProperty("data");
      if (responseData.success) {
        expect(responseData.data).toHaveProperty("sites");
        expect(responseData.data.sites).toHaveLength(2);
      }

      // Basic structure check without deep member access
    });

    it("should return authentication error for missing admin key", async () => {
      const res = await app.request("/sites", {}, env);

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
      const res = await app.request(
        "/sites",
        {
          headers: {
            Authorization: "Bearer invalid-key",
          },
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
  });
});
