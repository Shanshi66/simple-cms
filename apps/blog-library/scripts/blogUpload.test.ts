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
} from "@repo/types/api";

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
      siteName: string,
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

      expect(result.siteName).toBe("site1");
      expect(result.language).toBe("zh-CN");
      expect(result.filename).toBe("test-article.mdx");
      expect(result.fullPath).toContain(
        path.join("content", "site1", "zh-CN", "test-article.mdx"),
      );
    });

    it("should handle English language", () => {
      const result = uploader.testParseFilePath("mysite/en/blog-post.mdx");

      expect(result.siteName).toBe("mysite");
      expect(result.language).toBe("en");
      expect(result.filename).toBe("blog-post.mdx");
    });

    it("should throw error for invalid path format", () => {
      expect(() => uploader.testParseFilePath("invalid-path.mdx")).toThrow();
    });

    it("should throw error for invalid language", () => {
      expect(() =>
        uploader.testParseFilePath("site1/fr/article.mdx"),
      ).toThrow();
    });

    it("should throw error for non-MDX file", () => {
      expect(() =>
        uploader.testParseFilePath("site1/en/article.txt"),
      ).toThrow();
    });

    it("should handle nested paths correctly", () => {
      const result = uploader.testParseFilePath("content/site1/zh-CN/test.mdx");

      expect(result.siteName).toBe("site1");
      expect(result.language).toBe("zh-CN");
      expect(result.filename).toBe("test.mdx");
    });
  });

  describe("loadSiteConfig", () => {
    it("should load site configuration from environment", () => {
      process.env.ADMIN_API_KEY = "test-admin-key";

      const config = uploader.testLoadSiteConfig("site1");

      expect(config.name).toBe("site1");
      expect(config.apiKey).toBe("test-admin-key");
    });

    it("should handle different case site names", () => {
      process.env.ADMIN_API_KEY = "admin-key";

      const config = uploader.testLoadSiteConfig("mysite");

      expect(config.name).toBe("mysite");
      expect(config.apiKey).toBe("admin-key");
    });

    it("should throw error for missing API key", () => {
      delete process.env.ADMIN_API_KEY;

      expect(() => uploader.testLoadSiteConfig("site1")).toThrow();
    });
  });

  describe("checkLocalImages", () => {
    it("should return true when local images are found", () => {
      const contentWithLocalImages = `
# My Article

Here's a local image:
![Local image](./images/test.jpg)

And some text.
![Another local image](../assets/logo.png)
      `;

      const result = uploader.testCheckLocalImages(contentWithLocalImages);

      expect(result).toBe(true);
    });

    it("should return false when only HTTP images are found", () => {
      const contentWithHttpImages = `
# My Article

Here's a remote image:
![Remote image](https://example.com/image.jpg)

And another:
![CDN image](http://cdn.example.com/logo.png)
      `;

      const result = uploader.testCheckLocalImages(contentWithHttpImages);

      expect(result).toBe(false);
    });

    it("should return false when protocol-relative URLs are found", () => {
      const contentWithProtocolRelative = `
# My Article

Here's a protocol-relative image:
![Protocol relative](//example.com/image.jpg)
      `;

      const result = uploader.testCheckLocalImages(contentWithProtocolRelative);

      expect(result).toBe(false);
    });

    it("should return false when no images are found", () => {
      const contentWithoutImages = `
# My Article

This is just text content with no images.

Some more content here.
      `;

      const result = uploader.testCheckLocalImages(contentWithoutImages);

      expect(result).toBe(false);
    });

    it("should handle mixed content with both local and remote images", () => {
      const mixedContent = `
# My Article

Remote image: ![Remote](https://example.com/remote.jpg)
Local image: ![Local](./local.png)
      `;

      const result = uploader.testCheckLocalImages(mixedContent);

      expect(result).toBe(true);
    });

    it("should handle empty content", () => {
      const result = uploader.testCheckLocalImages("");

      expect(result).toBe(false);
    });

    it("should handle various local path formats", () => {
      const contentWithVariousPaths = `
# Test

![Relative](./image.jpg)
![Parent](../image.png)
![Absolute](/absolute/path.gif)
![Current](image.webp)
      `;

      const result = uploader.testCheckLocalImages(contentWithVariousPaths);

      expect(result).toBe(true);
    });
  });

  describe("upload", () => {
    beforeEach(() => {
      process.env.ADMIN_API_KEY = "test-admin-key";
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
      ).rejects.toThrow();
    });

    it("should handle MDX parsing errors", async () => {
      mockMDXParser.parse.mockRejectedValue(new Error("Invalid MDX syntax"));

      await expect(uploader.upload("site1/zh-CN/test.mdx")).rejects.toThrow();
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

      await expect(uploader.upload("site1/zh-CN/test.mdx")).rejects.toThrow();
    });

    it("should handle missing API key", async () => {
      delete process.env.ADMIN_API_KEY;

      await expect(uploader.upload("site1/zh-CN/test.mdx")).rejects.toThrow();
    });

    it("should handle missing base URL", async () => {
      delete process.env.CMS_BASE_URL;

      await expect(uploader.upload("site1/zh-CN/test.mdx")).rejects.toThrow();
    });

    it("should prevent upload when local images are found", async () => {
      const mockParseResult: ParseResult = {
        metadata: {
          title: "Test Article",
          excerpt: "Test excerpt",
          date: "2024-01-15",
          status: "published" as const,
          slug: "test-article",
        },
        content: `# Test Article

This content has a local image:
![Local image](./images/test.jpg)

And some text after.`,
      };

      mockMDXParser.parse.mockResolvedValue(mockParseResult);

      await expect(uploader.upload("site1/zh-CN/test.mdx")).rejects.toThrow();

      // Verify that the API client was never called
      expect(mockAPIClient.createArticle).not.toHaveBeenCalled();
    });

    it("should proceed with upload when no local images are found", async () => {
      const mockParseResult: ParseResult = {
        metadata: {
          title: "Test Article",
          excerpt: "Test excerpt",
          date: "2024-01-15",
          status: "published" as const,
          slug: "test-article",
        },
        content: `# Test Article

This content has only remote images:
![Remote image](https://example.com/image.jpg)

And some text after.`,
      };

      const mockResponse = {
        id: "article-123",
        message: "Article created successfully",
      };

      mockMDXParser.parse.mockResolvedValue(mockParseResult);
      mockAPIClient.createArticle.mockResolvedValue(mockResponse);

      await uploader.upload("site1/zh-CN/test.mdx");

      // Verify that the API client was called normally
      expect(mockAPIClient.createArticle).toHaveBeenCalledWith("site1", {
        language: "zh-CN",
        slug: "test-article",
        title: "Test Article",
        excerpt: "Test excerpt",
        date: "2024-01-15",
        status: "published",
        content: mockParseResult.content,
      });
    });
  });
});
