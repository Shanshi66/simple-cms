import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type MockedFunction,
} from "vitest";
import fetch, { Response as NodeFetchResponse } from "node-fetch";
import { APIClient } from "./api-client";
import type {
  CreateSiteRequest,
  CreateSiteResponse,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  ApiResponse,
} from "@repo/types/api";

// Mock Response type for testing
interface MockResponse {
  ok: boolean;
  status?: number;
  statusText?: string;
  json: MockedFunction<() => Promise<unknown>>;
  text: MockedFunction<() => Promise<string>>;
}

// Mock node-fetch
vi.mock("node-fetch", () => ({
  default: vi.fn(),
}));

const mockFetch = vi.mocked(fetch as MockedFunction<typeof fetch>);

describe("APIClient", () => {
  let client: APIClient;
  const baseURL = "https://api.example.com";
  const apiKey = "test-api-key";

  beforeEach(() => {
    client = new APIClient(baseURL, apiKey);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create instance with valid parameters", () => {
      expect(client).toBeInstanceOf(APIClient);
    });

    it("should remove trailing slash from baseURL", () => {
      const clientWithSlash = new APIClient("https://api.example.com/", apiKey);
      expect(clientWithSlash).toBeInstanceOf(APIClient);
    });

    it("should throw error with empty baseURL", () => {
      expect(() => new APIClient("", apiKey)).toThrow();
    });

    it("should throw error with empty apiKey", () => {
      expect(() => new APIClient(baseURL, "")).toThrow();
    });

    it("should throw error with missing parameters", () => {
      expect(() => new APIClient("", "")).toThrow();
    });
  });

  describe("createSite", () => {
    const validSiteData: CreateSiteRequest = {
      name: "test-site",
      description: "Test site description",
    };

    const mockSuccessResponse: CreateSiteResponse = {
      id: "site-123",
      name: "test-site",
      description: "Test site description",
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z",
    };

    it("should create site successfully", async () => {
      const mockResponse: MockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          data: mockSuccessResponse,
        } as ApiResponse<CreateSiteResponse>),
        text: vi.fn().mockResolvedValue(""),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as NodeFetchResponse);

      const result = await client.createSite(validSiteData);

      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/sites", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-api-key",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validSiteData),
      });
      expect(result).toEqual(mockSuccessResponse);
    });

    it("should handle site name without description", async () => {
      const siteDataWithoutDescription: CreateSiteRequest = {
        name: "test-site",
      };

      const mockResponseData = {
        ...mockSuccessResponse,
        description: null,
      };

      const mockResponse: MockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          data: mockResponseData,
        } as ApiResponse<CreateSiteResponse>),
        text: vi.fn().mockResolvedValue(""),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as NodeFetchResponse);

      const result = await client.createSite(siteDataWithoutDescription);

      expect(result).toEqual(mockResponseData);
    });

    it("should throw error for invalid site name format", async () => {
      const invalidSiteData = {
        name: "invalid site name!",
        description: "Test description",
      };

      await expect(client.createSite(invalidSiteData)).rejects.toThrow();
    });

    it("should throw error for empty site name", async () => {
      const invalidSiteData = {
        name: "",
        description: "Test description",
      };

      await expect(client.createSite(invalidSiteData)).rejects.toThrow();
    });

    it("should handle API error responses", async () => {
      const mockResponse: MockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: false,
          error: {
            code: "SITE_EXISTS",
            message: "Site already exists",
          },
        } as ApiResponse<CreateSiteResponse>),
        text: vi.fn().mockResolvedValue(""),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as NodeFetchResponse);

      await expect(client.createSite(validSiteData)).rejects.toThrow(
        "Site already exists",
      );
    });

    it("should handle HTTP error responses", async () => {
      const mockResponse: MockResponse = {
        ok: false,
        status: 409,
        statusText: "Conflict",
        json: vi.fn().mockResolvedValue({}),
        text: vi.fn().mockResolvedValue("Site name already exists"),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as NodeFetchResponse);

      await expect(client.createSite(validSiteData)).rejects.toThrow(
        "API request failed (409): Site name already exists",
      );
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      await expect(client.createSite(validSiteData)).rejects.toThrow(
        "Network error",
      );
    });
  });

  describe("createSiteApiKey", () => {
    const siteName = "test-site";
    const validKeyData: CreateApiKeyRequest = {
      name: "test-key",
      expiresAt: "2024-12-31T23:59:59.000Z",
    };

    const mockSuccessResponse: CreateApiKeyResponse = {
      id: "key-123",
      apiKey: "generated-api-key-string",
      name: "test-key",
      siteId: "site-123",
      expiresAt: "2024-12-31T23:59:59.000Z",
      createdAt: "2024-01-01T00:00:00.000Z",
    };

    it("should create site API key successfully", async () => {
      const mockResponse: MockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          data: mockSuccessResponse,
        } as ApiResponse<CreateApiKeyResponse>),
        text: vi.fn().mockResolvedValue(""),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as NodeFetchResponse);

      const result = await client.createSiteApiKey(siteName, validKeyData);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/sites/test-site/api-keys",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer test-api-key",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validKeyData),
        },
      );
      expect(result).toEqual(mockSuccessResponse);
    });

    it("should create API key without expiration date", async () => {
      const keyDataWithoutExpiration: CreateApiKeyRequest = {
        name: "permanent-key",
      };

      const mockResponseData = {
        ...mockSuccessResponse,
        name: "permanent-key",
        expiresAt: null,
      };

      const mockResponse: MockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          data: mockResponseData,
        } as ApiResponse<CreateApiKeyResponse>),
        text: vi.fn().mockResolvedValue(""),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as NodeFetchResponse);

      const result = await client.createSiteApiKey(
        siteName,
        keyDataWithoutExpiration,
      );

      expect(result).toEqual(mockResponseData);
    });

    it("should throw error for empty site name", async () => {
      await expect(client.createSiteApiKey("", validKeyData)).rejects.toThrow(
        "Site name is required",
      );
    });

    it("should throw error for empty key name", async () => {
      const invalidKeyData = {
        name: "",
        expiresAt: "2024-12-31T23:59:59.000Z",
      };

      await expect(
        client.createSiteApiKey(siteName, invalidKeyData),
      ).rejects.toThrow();
    });

    it("should throw error for invalid expiration date format", async () => {
      const invalidKeyData = {
        name: "test-key",
        expiresAt: "invalid-date",
      };

      await expect(
        client.createSiteApiKey(siteName, invalidKeyData),
      ).rejects.toThrow();
    });

    it("should handle site not found error", async () => {
      const mockResponse: MockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: false,
          error: {
            code: "SITE_NOT_FOUND",
            message: "Site not found",
          },
        } as ApiResponse<CreateApiKeyResponse>),
        text: vi.fn().mockResolvedValue(""),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as NodeFetchResponse);

      await expect(
        client.createSiteApiKey(siteName, validKeyData),
      ).rejects.toThrow("Site not found");
    });

    it("should handle HTTP error responses", async () => {
      const mockResponse: MockResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: vi.fn().mockResolvedValue({}),
        text: vi.fn().mockResolvedValue("Site not found"),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as NodeFetchResponse);

      await expect(
        client.createSiteApiKey(siteName, validKeyData),
      ).rejects.toThrow("API request failed (404): Site not found");
    });

    it("should handle authentication errors", async () => {
      const mockResponse: MockResponse = {
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: vi.fn().mockResolvedValue({}),
        text: vi.fn().mockResolvedValue("Unauthorized"),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as NodeFetchResponse);

      await expect(
        client.createSiteApiKey(siteName, validKeyData),
      ).rejects.toThrow("API request failed (401): Unauthorized");
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValue(new Error("Network connection failed"));

      await expect(
        client.createSiteApiKey(siteName, validKeyData),
      ).rejects.toThrow("Network connection failed");
    });
  });
});
