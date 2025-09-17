import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type MockedFunction,
} from "vitest";
import { SiteKeyCreator } from "./createSiteKey";
import type {
  CreateApiKeyRequest,
  CreateApiKeyResponse,
} from "@repo/types/api";

// Mock the external dependencies
vi.mock("../src/lib/api-client.js");
vi.mock("../src/lib/config.js");

// Mock types for better type safety
interface MockAPIClient {
  createSiteApiKey: MockedFunction<
    (
      siteName: string,
      keyData: CreateApiKeyRequest,
    ) => Promise<CreateApiKeyResponse>
  >;
}

// Mock the environment
const originalEnv = process.env;

describe("SiteKeyCreator", () => {
  let creator: SiteKeyCreator;
  let mockAPIClient: MockAPIClient;

  beforeEach(async () => {
    // Reset environment
    process.env = { ...originalEnv };

    // Setup mocks
    const { APIClient } = await import("../src/lib/api-client.js");
    const { loadConfig } = await import("../src/lib/config.js");

    mockAPIClient = {
      createSiteApiKey: vi.fn(),
    };

    vi.mocked(APIClient).mockImplementation(
      () => mockAPIClient as unknown as InstanceType<typeof APIClient>,
    );

    // Mock loadConfig function
    vi.mocked(loadConfig).mockReturnValue({
      baseURL: "https://api.cms.com",
      apiKey: "test-admin-key",
    });

    creator = new SiteKeyCreator();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe("loadConfig", () => {
    it("should load configuration from shared config module", () => {
      const config = creator.testLoadConfig();

      expect(config.baseURL).toBe("https://api.cms.com");
      expect(config.apiKey).toBe("test-admin-key");
    });
  });

  describe("validateSiteName", () => {
    it("should accept valid site names with letters only", () => {
      expect(() => creator.testValidateSiteName("myblog")).not.toThrow();
      expect(() => creator.testValidateSiteName("MyBlog")).not.toThrow();
      expect(() => creator.testValidateSiteName("MYBLOG")).not.toThrow();
    });

    it("should accept valid site names with letters and hyphens", () => {
      expect(() => creator.testValidateSiteName("my-blog")).not.toThrow();
      expect(() => creator.testValidateSiteName("personal-site")).not.toThrow();
      expect(() =>
        creator.testValidateSiteName("My-Personal-Blog"),
      ).not.toThrow();
    });

    it("should reject site names with numbers", () => {
      expect(() => creator.testValidateSiteName("blog123")).toThrow();
      expect(() => creator.testValidateSiteName("my-blog-2")).toThrow();
      expect(() => creator.testValidateSiteName("123blog")).toThrow();
    });

    it("should reject site names with underscores", () => {
      expect(() => creator.testValidateSiteName("my_blog")).toThrow();
      expect(() => creator.testValidateSiteName("personal_site")).toThrow();
    });

    it("should reject site names with special characters", () => {
      expect(() => creator.testValidateSiteName("my.blog")).toThrow();
      expect(() => creator.testValidateSiteName("blog@site")).toThrow();
      expect(() => creator.testValidateSiteName("site&blog")).toThrow();
      expect(() => creator.testValidateSiteName("blog!")).toThrow();
    });

    it("should reject site names with spaces", () => {
      expect(() => creator.testValidateSiteName("my blog")).toThrow();
      expect(() => creator.testValidateSiteName("personal site")).toThrow();
    });

    it("should reject empty site names", () => {
      expect(() => creator.testValidateSiteName("")).toThrow();
    });

    it("should reject site names starting or ending with hyphens", () => {
      expect(() => creator.testValidateSiteName("-myblog")).toThrow();
      expect(() => creator.testValidateSiteName("myblog-")).toThrow();
      expect(() => creator.testValidateSiteName("-my-blog-")).toThrow();
    });
  });

  describe("validateExpiresAt", () => {
    // Mock current time for consistent testing
    const mockNow = new Date("2024-01-01T00:00:00.000Z");

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(mockNow);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should accept valid ISO 8601 future dates", () => {
      expect(() =>
        creator.testValidateExpiresAt("2024-12-31T23:59:59.000Z"),
      ).not.toThrow();
      expect(() =>
        creator.testValidateExpiresAt("2025-06-15T12:30:45.123Z"),
      ).not.toThrow();
      expect(() =>
        creator.testValidateExpiresAt("2024-01-01T00:00:01.000Z"),
      ).not.toThrow();
    });

    it("should reject invalid ISO 8601 formats", () => {
      expect(() => creator.testValidateExpiresAt("2024-12-31")).toThrow();
      expect(() =>
        creator.testValidateExpiresAt("2024-12-31T23:59:59"),
      ).toThrow();
      expect(() =>
        creator.testValidateExpiresAt("2024-12-31T23:59:59Z"),
      ).toThrow();
      expect(() =>
        creator.testValidateExpiresAt("2024/12/31 23:59:59"),
      ).toThrow();
      expect(() => creator.testValidateExpiresAt("Dec 31, 2024")).toThrow();
    });

    it("should reject past dates", () => {
      expect(() =>
        creator.testValidateExpiresAt("2023-12-31T23:59:59.000Z"),
      ).toThrow();
      expect(() =>
        creator.testValidateExpiresAt("2023-01-01T00:00:00.000Z"),
      ).toThrow();
    });

    it("should reject current time (not future)", () => {
      expect(() =>
        creator.testValidateExpiresAt("2024-01-01T00:00:00.000Z"),
      ).toThrow();
    });

    it("should reject invalid date strings", () => {
      expect(() => creator.testValidateExpiresAt("invalid-date")).toThrow();
      expect(() => creator.testValidateExpiresAt("")).toThrow();
      expect(() =>
        creator.testValidateExpiresAt("2024-13-01T00:00:00.000Z"),
      ).toThrow();
      expect(() =>
        creator.testValidateExpiresAt("2024-12-32T00:00:00.000Z"),
      ).toThrow();
    });
  });

  describe("createSiteKey", () => {
    beforeEach(() => {
      process.env.CMS_BASE_URL = "https://api.cms.com";
      process.env.ADMIN_API_KEY = "test-admin-key";
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should create API key successfully without expiration", async () => {
      const mockResponse: CreateApiKeyResponse = {
        id: "key-123",
        apiKey: "ak_test1234567890abcdef",
        name: "upload-key",
        siteId: "site-456",
        expiresAt: null,
        createdAt: "2024-01-01T00:00:00.000Z",
      };

      mockAPIClient.createSiteApiKey.mockResolvedValue(mockResponse);

      await creator.createSiteKey("my-blog", "upload-key");

      expect(mockAPIClient.createSiteApiKey).toHaveBeenCalledWith("my-blog", {
        name: "upload-key",
        expiresAt: undefined,
      });
    });

    it("should create API key successfully with expiration", async () => {
      const mockResponse: CreateApiKeyResponse = {
        id: "key-123",
        apiKey: "ak_test1234567890abcdef",
        name: "upload-key",
        siteId: "site-456",
        expiresAt: "2024-12-31T23:59:59.000Z",
        createdAt: "2024-01-01T00:00:00.000Z",
      };

      mockAPIClient.createSiteApiKey.mockResolvedValue(mockResponse);

      await creator.createSiteKey(
        "my-blog",
        "upload-key",
        "2024-12-31T23:59:59.000Z",
      );

      expect(mockAPIClient.createSiteApiKey).toHaveBeenCalledWith("my-blog", {
        name: "upload-key",
        expiresAt: "2024-12-31T23:59:59.000Z",
      });
    });

    it("should handle site name validation errors", async () => {
      await expect(
        creator.createSiteKey("invalid_name", "upload-key"),
      ).rejects.toThrow();

      // Verify that the API client was never called
      expect(mockAPIClient.createSiteApiKey).not.toHaveBeenCalled();
    });

    it("should handle expiration date validation errors", async () => {
      await expect(
        creator.createSiteKey("my-blog", "upload-key", "invalid-date"),
      ).rejects.toThrow();

      // Verify that the API client was never called
      expect(mockAPIClient.createSiteApiKey).not.toHaveBeenCalled();
    });

    it("should handle past expiration date errors", async () => {
      await expect(
        creator.createSiteKey(
          "my-blog",
          "upload-key",
          "2023-12-31T23:59:59.000Z",
        ),
      ).rejects.toThrow();

      // Verify that the API client was never called
      expect(mockAPIClient.createSiteApiKey).not.toHaveBeenCalled();
    });

    it("should handle missing environment variables", async () => {
      const { loadConfig } = await import("../src/lib/config.js");

      // Mock loadConfig to throw error for missing environment variables
      vi.mocked(loadConfig).mockImplementation(() => {
        throw new Error(
          "Missing CMS base URL. Please set CMS_BASE_URL in your .env file",
        );
      });

      // Create a new instance that will fail during construction due to missing config
      expect(() => new SiteKeyCreator()).toThrow(
        "Missing CMS base URL. Please set CMS_BASE_URL in your .env file",
      );

      // Verify that the API client was never called
      expect(mockAPIClient.createSiteApiKey).not.toHaveBeenCalled();
    });

    it("should handle API errors - site not found", async () => {
      // Reset loadConfig mock to return valid config for this test
      const { loadConfig } = await import("../src/lib/config.js");
      vi.mocked(loadConfig).mockReturnValue({
        baseURL: "https://api.cms.com",
        apiKey: "test-admin-key",
      });

      // Create a fresh instance for this test
      const testCreator = new SiteKeyCreator();

      mockAPIClient.createSiteApiKey.mockRejectedValue(
        new Error("API request failed (404): Site not found"),
      );

      await expect(
        testCreator.createSiteKey("nonexistent-site", "upload-key"),
      ).rejects.toThrow();

      expect(mockAPIClient.createSiteApiKey).toHaveBeenCalledWith(
        "nonexistent-site",
        {
          name: "upload-key",
          expiresAt: undefined,
        },
      );
    });

    it("should handle API errors - duplicate key name", async () => {
      mockAPIClient.createSiteApiKey.mockRejectedValue(
        new Error("API request failed (409): API key name already exists"),
      );

      await expect(
        creator.createSiteKey("my-blog", "existing-key"),
      ).rejects.toThrow();

      expect(mockAPIClient.createSiteApiKey).toHaveBeenCalledWith("my-blog", {
        name: "existing-key",
        expiresAt: undefined,
      });
    });

    it("should handle authentication errors", async () => {
      mockAPIClient.createSiteApiKey.mockRejectedValue(
        new Error("API request failed (401): Unauthorized"),
      );

      await expect(
        creator.createSiteKey("my-blog", "upload-key"),
      ).rejects.toThrow();
    });

    it("should handle network errors", async () => {
      mockAPIClient.createSiteApiKey.mockRejectedValue(
        new Error("API request failed (500): Internal server error"),
      );

      await expect(
        creator.createSiteKey("my-blog", "upload-key"),
      ).rejects.toThrow();
    });

    it("should validate various site name formats", async () => {
      const mockResponse: CreateApiKeyResponse = {
        id: "key-123",
        apiKey: "ak_test1234567890abcdef",
        name: "test-key",
        siteId: "site-456",
        expiresAt: null,
        createdAt: "2024-01-01T00:00:00.000Z",
      };

      mockAPIClient.createSiteApiKey.mockResolvedValue(mockResponse);

      // Test various valid site name formats
      await creator.createSiteKey("blog", "test-key");
      await creator.createSiteKey("my-personal-blog", "test-key");
      await creator.createSiteKey("Portfolio", "test-key");
      await creator.createSiteKey("COMPANY-BLOG", "test-key");

      expect(mockAPIClient.createSiteApiKey).toHaveBeenCalledTimes(4);
    });

    it("should reject various invalid site name formats", async () => {
      const invalidNames = [
        "site_name",
        "site123",
        "site.com",
        "site@domain",
        "site name",
        "-sitename",
        "sitename-",
        "site&blog",
        "site!",
        "",
      ];

      for (const invalidName of invalidNames) {
        await expect(
          creator.createSiteKey(invalidName, "test-key"),
        ).rejects.toThrow();
      }

      // Verify that the API client was never called for invalid names
      expect(mockAPIClient.createSiteApiKey).not.toHaveBeenCalled();
    });

    it("should validate various expiration date formats", async () => {
      const mockResponse: CreateApiKeyResponse = {
        id: "key-123",
        apiKey: "ak_test1234567890abcdef",
        name: "test-key",
        siteId: "site-456",
        expiresAt: "2024-12-31T23:59:59.000Z",
        createdAt: "2024-01-01T00:00:00.000Z",
      };

      mockAPIClient.createSiteApiKey.mockResolvedValue(mockResponse);

      // Test various valid expiration formats
      await creator.createSiteKey(
        "my-blog",
        "test-key",
        "2024-12-31T23:59:59.000Z",
      );
      await creator.createSiteKey(
        "my-blog",
        "test-key2",
        "2025-06-15T12:30:45.123Z",
      );

      expect(mockAPIClient.createSiteApiKey).toHaveBeenCalledTimes(2);
    });

    it("should reject various invalid expiration date formats", async () => {
      const invalidDates = [
        "2024-12-31",
        "2024-12-31T23:59:59",
        "2024-12-31T23:59:59Z",
        "2024/12/31 23:59:59",
        "Dec 31, 2024",
        "invalid-date",
        "",
        "2023-12-31T23:59:59.000Z", // past date
      ];

      for (const invalidDate of invalidDates) {
        await expect(
          creator.createSiteKey("my-blog", "test-key", invalidDate),
        ).rejects.toThrow();
      }

      // Verify that the API client was never called for invalid dates
      expect(mockAPIClient.createSiteApiKey).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    beforeEach(() => {
      process.env.CMS_BASE_URL = "https://api.cms.com";
      process.env.ADMIN_API_KEY = "test-admin-key";
    });

    it("should handle and re-throw errors for testing", async () => {
      mockAPIClient.createSiteApiKey.mockRejectedValue(
        new Error("API request failed"),
      );

      let errorThrown = false;
      try {
        await creator.createSiteKey("my-blog", "upload-key");
      } catch (error) {
        errorThrown = true;
        expect(error).toBeInstanceOf(Error);
      }

      expect(errorThrown).toBe(true);
    });

    it("should handle validation errors", async () => {
      let errorThrown = false;
      try {
        await creator.createSiteKey("invalid_name", "upload-key");
      } catch (error) {
        errorThrown = true;
        expect(error).toBeInstanceOf(Error);
      }

      expect(errorThrown).toBe(true);
    });

    it("should handle configuration errors", async () => {
      delete process.env.ADMIN_API_KEY;

      let errorThrown = false;
      try {
        await creator.createSiteKey("my-blog", "upload-key");
      } catch (error) {
        errorThrown = true;
        expect(error).toBeInstanceOf(Error);
      }

      expect(errorThrown).toBe(true);
    });

    it("should handle expiration date validation errors", async () => {
      let errorThrown = false;
      try {
        await creator.createSiteKey("my-blog", "upload-key", "invalid-date");
      } catch (error) {
        errorThrown = true;
        expect(error).toBeInstanceOf(Error);
      }

      expect(errorThrown).toBe(true);
    });
  });
});
