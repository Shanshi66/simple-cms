import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadConfig, loadBaseURL, loadAdminAPIKey } from "./config";

// Mock the environment
const originalEnv = process.env;

describe("config", () => {
  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("loadBaseURL", () => {
    it("should load base URL from environment variables", () => {
      process.env.CMS_BASE_URL = "https://api.cms.com";

      const baseURL = loadBaseURL();

      expect(baseURL).toBe("https://api.cms.com");
    });

    it("should throw error for missing CMS_BASE_URL", () => {
      delete process.env.CMS_BASE_URL;

      expect(() => loadBaseURL()).toThrow();
    });
  });

  describe("loadAdminAPIKey", () => {
    it("should load admin API key from environment variables", () => {
      process.env.ADMIN_API_KEY = "test-admin-key";

      const apiKey = loadAdminAPIKey();

      expect(apiKey).toBe("test-admin-key");
    });

    it("should throw error for missing ADMIN_API_KEY", () => {
      delete process.env.ADMIN_API_KEY;

      expect(() => loadAdminAPIKey()).toThrow();
    });
  });

  describe("loadConfig", () => {
    it("should load complete configuration from environment variables", () => {
      process.env.CMS_BASE_URL = "https://api.cms.com";
      process.env.ADMIN_API_KEY = "test-admin-key";

      const config = loadConfig();

      expect(config.baseURL).toBe("https://api.cms.com");
      expect(config.apiKey).toBe("test-admin-key");
    });

    it("should throw error for missing CMS_BASE_URL", () => {
      process.env.ADMIN_API_KEY = "test-key";
      delete process.env.CMS_BASE_URL;

      expect(() => loadConfig()).toThrow();
    });

    it("should throw error for missing ADMIN_API_KEY", () => {
      process.env.CMS_BASE_URL = "https://api.cms.com";
      delete process.env.ADMIN_API_KEY;

      expect(() => loadConfig()).toThrow();
    });

    it("should throw error for both missing environment variables", () => {
      delete process.env.CMS_BASE_URL;
      delete process.env.ADMIN_API_KEY;

      expect(() => loadConfig()).toThrow();
    });
  });
});
