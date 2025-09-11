import { describe, it, expect, beforeEach } from "vitest";
import { Hono } from "hono";
import { adminAuth } from "./admin-auth";
import { errorHandler } from "@/error";
import { CFBindings, MiddlewareVars } from "@/types/context";
import { ErrorCode } from "@repo/types/errors";
import { env } from "cloudflare:test";

describe("Admin Authentication Middleware", () => {
  let app: Hono<{ Bindings: CFBindings; Variables: MiddlewareVars }>;
  const testAdminKey = "test-admin-api-key";

  beforeEach(() => {
    app = new Hono<{ Bindings: CFBindings; Variables: MiddlewareVars }>();

    // Set up error handler like in the main app
    app.onError(errorHandler);

    // Set up test environment with admin key
    app.use("*", (c, next) => {
      c.env = {
        ...env,
        ADMIN_API_KEY: testAdminKey,
      } as unknown as CFBindings;
      return next();
    });

    // Apply admin auth middleware to test route
    app.use("*", adminAuth());

    // Add test route that requires admin auth
    app.get("/test", (c) => {
      return c.json({ message: "Admin access granted" });
    });
  });

  describe("Valid Authentication", () => {
    it("should allow access with valid admin key", async () => {
      const res = await app.request("/test", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${testAdminKey}`,
        },
      });

      expect(res.status).toBe(200);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("message", "Admin access granted");
    });

    it("should handle Bearer token with extra spaces", async () => {
      const res = await app.request("/test", {
        method: "GET",
        headers: {
          Authorization: `Bearer  ${testAdminKey}  `,
        },
      });

      expect(res.status).toBe(200);
    });
  });

  describe("Missing Authorization", () => {
    it("should return 401 when Authorization header is missing", async () => {
      const res = await app.request("/test", {
        method: "GET",
      });

      expect(res.status).toBe(401);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty(
        "error.code",
        ErrorCode.INVALID_ADMIN_KEY,
      );
      expect(responseBody).toHaveProperty(
        "error.message",
        "Missing Authorization header",
      );
    });

    it("should return 401 when Authorization header is empty", async () => {
      const res = await app.request("/test", {
        method: "GET",
        headers: {
          Authorization: "",
        },
      });

      expect(res.status).toBe(401);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty(
        "error.code",
        ErrorCode.INVALID_ADMIN_KEY,
      );
    });
  });

  describe("Invalid Authorization Format", () => {
    it("should return 401 when Authorization header lacks Bearer prefix", async () => {
      const res = await app.request("/test", {
        method: "GET",
        headers: {
          Authorization: testAdminKey,
        },
      });

      expect(res.status).toBe(401);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty(
        "error.code",
        ErrorCode.INVALID_ADMIN_KEY,
      );
      expect(responseBody).toHaveProperty("error.message");
      const responseString = JSON.stringify(responseBody);
      expect(
        responseString.includes("Invalid Authorization header format"),
      ).toBe(true);
    });

    it("should return 401 when Bearer token is empty", async () => {
      const res = await app.request("/test", {
        method: "GET",
        headers: {
          Authorization: "Bearer",
        },
      });

      expect(res.status).toBe(401);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty(
        "error.code",
        ErrorCode.INVALID_ADMIN_KEY,
      );
    });

    it("should return 401 when Bearer token is only spaces", async () => {
      const res = await app.request("/test", {
        method: "GET",
        headers: {
          Authorization: "Bearer   ",
        },
      });

      expect(res.status).toBe(401);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty(
        "error.code",
        ErrorCode.INVALID_ADMIN_KEY,
      );
    });
  });

  describe("Invalid Admin Key", () => {
    it("should return 401 when admin key is incorrect", async () => {
      const res = await app.request("/test", {
        method: "GET",
        headers: {
          Authorization: "Bearer wrong-admin-key",
        },
      });

      expect(res.status).toBe(401);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty(
        "error.code",
        ErrorCode.INVALID_ADMIN_KEY,
      );
      expect(responseBody).toHaveProperty(
        "error.message",
        "Invalid admin API key",
      );
    });

    it("should return 401 when admin key is partially correct", async () => {
      const res = await app.request("/test", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${testAdminKey.slice(0, -1)}`,
        },
      });

      expect(res.status).toBe(401);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty(
        "error.code",
        ErrorCode.INVALID_ADMIN_KEY,
      );
    });
  });

  describe("Environment Configuration", () => {
    it("should return 401 when ADMIN_API_KEY is not configured", async () => {
      // Create new app without admin key configured
      const noKeyApp = new Hono<{
        Bindings: CFBindings;
        Variables: MiddlewareVars;
      }>();
      noKeyApp.onError(errorHandler);

      noKeyApp.use("*", (c, next) => {
        c.env = {
          ...env,
          // ADMIN_API_KEY is not set
        } as unknown as CFBindings;
        return next();
      });

      noKeyApp.use("*", adminAuth());
      noKeyApp.get("/test", (c) => c.json({ message: "Success" }));

      const res = await noKeyApp.request("/test", {
        method: "GET",
        headers: {
          Authorization: "Bearer any-key",
        },
      });

      expect(res.status).toBe(401);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty(
        "error.code",
        ErrorCode.INVALID_ADMIN_KEY,
      );
      expect(responseBody).toHaveProperty(
        "error.message",
        "Admin API key not configured",
      );
    });
  });

  describe("Different HTTP Methods", () => {
    beforeEach(() => {
      app.post("/test", (c) => c.json({ method: "POST" }));
      app.put("/test", (c) => c.json({ method: "PUT" }));
      app.delete("/test", (c) => c.json({ method: "DELETE" }));
    });

    it("should work with POST requests", async () => {
      const res = await app.request("/test", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${testAdminKey}`,
        },
      });

      expect(res.status).toBe(200);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("method", "POST");
    });

    it("should work with PUT requests", async () => {
      const res = await app.request("/test", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${testAdminKey}`,
        },
      });

      expect(res.status).toBe(200);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("method", "PUT");
    });

    it("should work with DELETE requests", async () => {
      const res = await app.request("/test", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${testAdminKey}`,
        },
      });

      expect(res.status).toBe(200);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("method", "DELETE");
    });
  });
});
