import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type MockedFunction,
} from "vitest";
import { existsSync } from "fs-extra";
import path from "path";
import { BlogUploader } from "./blogUpload";
import type { ParseResult } from "@/types/article";
import type {
  CreateArticleRequest,
  CreateArticleResponse,
} from "@repo/types/cms";

// Mock the external dependencies
vi.mock("../src/lib/mdx-parser.js");
vi.mock("../src/lib/api-client.js");
vi.mock("fs-extra", async () => {
  const actual = await vi.importActual("fs-extra");
  return {
    ...actual,
    existsSync: vi.fn(),
  };
});

// Mock types for better type safety
interface MockMDXParser {
  parse: MockedFunction<(filePath: string) => Promise<ParseResult>>;
  validateMetadata: MockedFunction<(metadata: unknown) => void>;
  validateMDX: MockedFunction<(content: string) => Promise<boolean>>;
}

interface MockAPIClient {
  createArticle: MockedFunction<
    (
      siteId: string,
      articleData: CreateArticleRequest,
    ) => Promise<CreateArticleResponse>
  >;
}

// Mock the environment
const originalEnv = process.env;

describe("BlogUploader", () => {
  let uploader: BlogUploader;
  let mockMDXParser: MockMDXParser;
  let mockAPIClient: MockAPIClient;

  beforeEach(async () => {
    // Reset environment
    process.env = { ...originalEnv };

    // Setup mocks
    const { MDXParser } = await import("../src/lib/mdx-parser.js");
    const { APIClient } = await import("../src/lib/api-client.js");

    mockMDXParser = {
      parse: vi.fn(),
      validateMetadata: vi.fn(),
      validateMDX: vi.fn(),
    };
    mockAPIClient = {
      createArticle: vi.fn(),
    };

    vi.mocked(MDXParser).mockImplementation(() => mockMDXParser);
    vi.mocked(APIClient).mockImplementation(
      () => mockAPIClient as unknown as InstanceType<typeof APIClient>,
    );

    uploader = new BlogUploader();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe("parseFilePath", () => {
    it("should parse valid file path correctly", () => {
      const result = uploader.testParseFilePath("site1/zh-CN/test-article.mdx");

      expect(result.siteId).toBe("site1");
      expect(result.language).toBe("zh-CN");
      expect(result.filename).toBe("test-article.mdx");
      expect(result.fullPath).toContain(
        path.join("content", "site1", "zh-CN", "test-article.mdx"),
      );
    });

    it("should handle English language", () => {
      const result = uploader.testParseFilePath("mysite/en/blog-post.mdx");

      expect(result.siteId).toBe("mysite");
      expect(result.language).toBe("en");
      expect(result.filename).toBe("blog-post.mdx");
    });

    it("should throw error for invalid path format", () => {
      expect(() => uploader.testParseFilePath("invalid-path.mdx")).toThrow(
        "Invalid file path format. Expected format: siteId/language/filename.mdx",
      );
    });

    it("should throw error for invalid language", () => {
      expect(() => uploader.testParseFilePath("site1/fr/article.mdx")).toThrow(
        'Invalid language "fr". Supported languages: en, zh-CN',
      );
    });

    it("should throw error for non-MDX file", () => {
      expect(() => uploader.testParseFilePath("site1/en/article.txt")).toThrow(
        "File must have .mdx extension",
      );
    });

    it("should handle nested paths correctly", () => {
      const result = uploader.testParseFilePath("content/site1/zh-CN/test.mdx");

      expect(result.siteId).toBe("site1");
      expect(result.language).toBe("zh-CN");
      expect(result.filename).toBe("test.mdx");
    });
  });

  describe("loadSiteConfig", () => {
    it("should load site configuration from environment", () => {
      process.env.SITE1_API_KEY = "test-api-key";

      const config = uploader.testLoadSiteConfig("site1");

      expect(config.id).toBe("site1");
      expect(config.apiKey).toBe("test-api-key");
    });

    it("should handle different case site IDs", () => {
      process.env.MYSITE_API_KEY = "my-api-key";

      const config = uploader.testLoadSiteConfig("mysite");

      expect(config.id).toBe("mysite");
      expect(config.apiKey).toBe("my-api-key");
    });

    it("should throw error for missing API key", () => {
      delete process.env.SITE1_API_KEY;

      expect(() => uploader.testLoadSiteConfig("site1")).toThrow(
        'Missing API key for site "site1". Please set SITE1_API_KEY in your .env file',
      );
    });
  });

  describe("upload", () => {
    beforeEach(() => {
      process.env.SITE1_API_KEY = "test-api-key";
      process.env.CMS_BASE_URL = "https://api.cms.com";

      vi.mocked(existsSync).mockReturnValue(true);
    });

    it("should upload article successfully", async () => {
      const mockParseResult: ParseResult = {
        metadata: {
          title: "Test Article",
          excerpt: "Test excerpt",
          date: "2024-01-15",
          status: "published" as const,
          slug: "test-article",
        },
        content: "# Test Content",
      };

      const mockResponse = {
        id: "article-123",
        message: "Article created successfully",
      };

      mockMDXParser.parse.mockResolvedValue(mockParseResult);
      mockAPIClient.createArticle.mockResolvedValue(mockResponse);

      await uploader.upload("site1/zh-CN/test-article.mdx");

      expect(mockMDXParser.parse).toHaveBeenCalledWith(
        expect.stringContaining(
          path.join("content", "site1", "zh-CN", "test-article.mdx"),
        ),
      );
      expect(mockAPIClient.createArticle).toHaveBeenCalledWith("site1", {
        language: "zh-CN",
        slug: "test-article",
        title: "Test Article",
        excerpt: "Test excerpt",
        date: "2024-01-15",
        status: "published",
        content: "# Test Content",
      });
    });

    it("should throw error when file does not exist", async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      await expect(
        uploader.upload("site1/zh-CN/nonexistent.mdx"),
      ).rejects.toThrow("File not found:");
    });

    it("should handle MDX parsing errors", async () => {
      mockMDXParser.parse.mockRejectedValue(new Error("Invalid MDX syntax"));

      await expect(uploader.upload("site1/zh-CN/test.mdx")).rejects.toThrow(
        "Invalid MDX syntax",
      );
    });

    it("should handle API errors", async () => {
      const mockParseResult: ParseResult = {
        metadata: {
          title: "Test Article",
          excerpt: "Test excerpt",
          date: "2024-01-15",
          status: "published" as const,
          slug: "test-article",
        },
        content: "# Test Content",
      };

      mockMDXParser.parse.mockResolvedValue(mockParseResult);
      mockAPIClient.createArticle.mockRejectedValue(
        new Error("API request failed (409): Article already exists"),
      );

      await expect(uploader.upload("site1/zh-CN/test.mdx")).rejects.toThrow(
        "API request failed (409): Article already exists",
      );
    });

    it("should handle missing API key", async () => {
      delete process.env.SITE1_API_KEY;

      await expect(uploader.upload("site1/zh-CN/test.mdx")).rejects.toThrow(
        'Missing API key for site "site1"',
      );
    });

    it("should handle missing base URL", async () => {
      delete process.env.CMS_BASE_URL;

      await expect(uploader.upload("site1/zh-CN/test.mdx")).rejects.toThrow(
        "Missing CMS base URL",
      );
    });
  });
});
