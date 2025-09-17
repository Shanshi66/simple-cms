import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type MockedFunction,
} from "vitest";
import { SiteCreator } from "./createSite";
import type { CreateSiteRequest, CreateSiteResponse } from "@repo/types/api";

// Mock the external dependencies
vi.mock("../src/lib/api-client.js");
vi.mock("../src/lib/config.js");

// Mock types for better type safety
interface MockAPIClient {
  createSite: MockedFunction<
    (siteData: CreateSiteRequest) => Promise<CreateSiteResponse>
  >;
}

// Mock the environment
const originalEnv = process.env;

describe("SiteCreator", () => {
  let creator: SiteCreator;
  let mockAPIClient: MockAPIClient;

  beforeEach(async () => {
    // Reset environment
    process.env = { ...originalEnv };

    // Setup mocks
    const { APIClient } = await import("../src/lib/api-client.js");
    const { loadConfig } = await import("../src/lib/config.js");

    mockAPIClient = {
      createSite: vi.fn(),
    };

    vi.mocked(APIClient).mockImplementation(
      () => mockAPIClient as unknown as InstanceType<typeof APIClient>,
    );

    // Mock loadConfig function
    vi.mocked(loadConfig).mockReturnValue({
      baseURL: "https://api.cms.com",
      apiKey: "test-admin-key",
    });

    creator = new SiteCreator();
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

  describe("createSite", () => {
    beforeEach(() => {
      process.env.CMS_BASE_URL = "https://api.cms.com";
      process.env.ADMIN_API_KEY = "test-admin-key";
    });

    it("should create site successfully with name only", async () => {
      const mockResponse: CreateSiteResponse = {
        id: "site-123",
        name: "my-blog",
        description: null,
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z",
      };

      mockAPIClient.createSite.mockResolvedValue(mockResponse);

      await creator.createSite("my-blog");

      expect(mockAPIClient.createSite).toHaveBeenCalledWith({
        name: "my-blog",
        description: undefined,
      });
    });

    it("should create site successfully with name and description", async () => {
      const mockResponse: CreateSiteResponse = {
        id: "site-123",
        name: "my-blog",
        description: "My personal blog site",
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z",
      };

      mockAPIClient.createSite.mockResolvedValue(mockResponse);

      await creator.createSite("my-blog", "My personal blog site");

      expect(mockAPIClient.createSite).toHaveBeenCalledWith({
        name: "my-blog",
        description: "My personal blog site",
      });
    });

    it("should handle site name validation errors", async () => {
      await expect(creator.createSite("invalid_name")).rejects.toThrow();

      // Verify that the API client was never called
      expect(mockAPIClient.createSite).not.toHaveBeenCalled();
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
      expect(() => new SiteCreator()).toThrow(
        "Missing CMS base URL. Please set CMS_BASE_URL in your .env file",
      );

      // Verify that the API client was never called
      expect(mockAPIClient.createSite).not.toHaveBeenCalled();
    });

    it("should handle API errors", async () => {
      // Reset loadConfig mock to return valid config for this test
      const { loadConfig } = await import("../src/lib/config.js");
      vi.mocked(loadConfig).mockReturnValue({
        baseURL: "https://api.cms.com",
        apiKey: "test-admin-key",
      });

      // Create a fresh instance for this test
      const testCreator = new SiteCreator();

      mockAPIClient.createSite.mockRejectedValue(
        new Error("API request failed (409): Site already exists"),
      );

      await expect(testCreator.createSite("existing-site")).rejects.toThrow();

      expect(mockAPIClient.createSite).toHaveBeenCalledWith({
        name: "existing-site",
        description: undefined,
      });
    });

    it("should handle network errors", async () => {
      mockAPIClient.createSite.mockRejectedValue(
        new Error("API request failed (500): Internal server error"),
      );

      await expect(creator.createSite("my-blog")).rejects.toThrow();
    });

    it("should handle authentication errors", async () => {
      mockAPIClient.createSite.mockRejectedValue(
        new Error("API request failed (401): Unauthorized"),
      );

      await expect(creator.createSite("my-blog")).rejects.toThrow();
    });

    it("should validate site names with various valid formats", async () => {
      const mockResponse: CreateSiteResponse = {
        id: "site-123",
        name: "test-site",
        description: null,
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z",
      };

      mockAPIClient.createSite.mockResolvedValue(mockResponse);

      // Test various valid site name formats
      await creator.createSite("blog");
      await creator.createSite("my-personal-blog");
      await creator.createSite("Portfolio");
      await creator.createSite("COMPANY-BLOG");

      expect(mockAPIClient.createSite).toHaveBeenCalledTimes(4);
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
        await expect(creator.createSite(invalidName)).rejects.toThrow();
      }

      // Verify that the API client was never called for invalid names
      expect(mockAPIClient.createSite).not.toHaveBeenCalled();
    });

    it("should handle empty description as undefined", async () => {
      const mockResponse: CreateSiteResponse = {
        id: "site-123",
        name: "my-blog",
        description: null,
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z",
      };

      mockAPIClient.createSite.mockResolvedValue(mockResponse);

      await creator.createSite("my-blog", "");

      expect(mockAPIClient.createSite).toHaveBeenCalledWith({
        name: "my-blog",
        description: "",
      });
    });
  });

  describe("error handling", () => {
    beforeEach(() => {
      process.env.CMS_BASE_URL = "https://api.cms.com";
      process.env.ADMIN_API_KEY = "test-admin-key";
    });

    it("should handle and re-throw errors for testing", async () => {
      mockAPIClient.createSite.mockRejectedValue(
        new Error("API request failed"),
      );

      let errorThrown = false;
      try {
        await creator.createSite("my-blog");
      } catch (error) {
        errorThrown = true;
        expect(error).toBeInstanceOf(Error);
      }

      expect(errorThrown).toBe(true);
    });

    it("should handle validation errors", async () => {
      let errorThrown = false;
      try {
        await creator.createSite("invalid_name");
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
        await creator.createSite("my-blog");
      } catch (error) {
        errorThrown = true;
        expect(error).toBeInstanceOf(Error);
      }

      expect(errorThrown).toBe(true);
    });
  });
});
