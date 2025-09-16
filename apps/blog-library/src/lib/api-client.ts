import fetch from "node-fetch";
import { ApiResponse } from "@repo/types/api";
import {
  CreateArticleRequest,
  CreateArticleResponse,
  CreateArticleRequestSchema,
  CreateArticleResponseSchema,
  CreateSiteRequest,
  CreateSiteResponse,
  CreateSiteRequestSchema,
  CreateSiteResponseSchema,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  CreateApiKeyRequestSchema,
  CreateApiKeyResponseSchema,
} from "@repo/types/api";

export class APIClient {
  private readonly baseURL: string;
  private readonly apiKey: string;

  constructor(baseURL: string, apiKey: string) {
    if (!baseURL || !apiKey) {
      throw new Error("Base URL and API key are required");
    }
    this.baseURL = baseURL.replace(/\/$/, ""); // Remove trailing slash
    this.apiKey = apiKey;
  }

  /**
   * Create an article for a specific site
   */
  async createArticle(
    siteName: string,
    articleData: CreateArticleRequest,
  ): Promise<CreateArticleResponse> {
    if (!siteName) {
      throw new Error("Site name is required");
    }

    // Validate request data using Zod schema
    const validatedData = CreateArticleRequestSchema.parse(articleData);

    const url = `${this.baseURL}/sites/${siteName}/articles`;
    const requestOptions = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedData),
    };

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API request failed (${response.status}): ${
          errorText || response.statusText
        }`,
      );
    }

    const responseData =
      (await response.json()) as ApiResponse<CreateArticleResponse>;

    // Check if response indicates success
    if (responseData.success) {
      // Validate response structure using schema
      const validatedResponse = CreateArticleResponseSchema.parse(
        responseData.data,
      );
      return validatedResponse;
    } else {
      // Handle error response with simple error message
      throw new Error(responseData.error.message || "API request failed");
    }
  }

  /**
   * Create a new site
   */
  async createSite(siteData: CreateSiteRequest): Promise<CreateSiteResponse> {
    // Validate request data using Zod schema
    const validatedData = CreateSiteRequestSchema.parse(siteData);

    const url = `${this.baseURL}/sites`;
    const requestOptions = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedData),
    };

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API request failed (${response.status}): ${
          errorText || response.statusText
        }`,
      );
    }

    const responseData =
      (await response.json()) as ApiResponse<CreateSiteResponse>;

    // Check if response indicates success
    if (responseData.success) {
      // Validate response structure using schema
      const validatedResponse = CreateSiteResponseSchema.parse(
        responseData.data,
      );
      return validatedResponse;
    } else {
      // Handle error response with simple error message
      throw new Error(responseData.error.message || "API request failed");
    }
  }

  /**
   * Create an API key for a specific site
   */
  async createSiteApiKey(
    siteName: string,
    keyData: CreateApiKeyRequest,
  ): Promise<CreateApiKeyResponse> {
    if (!siteName) {
      throw new Error("Site name is required");
    }

    // Validate request data using Zod schema
    const validatedData = CreateApiKeyRequestSchema.parse(keyData);

    const url = `${this.baseURL}/sites/${siteName}/api-keys`;
    const requestOptions = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedData),
    };

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API request failed (${response.status}): ${
          errorText || response.statusText
        }`,
      );
    }

    const responseData =
      (await response.json()) as ApiResponse<CreateApiKeyResponse>;

    // Check if response indicates success
    if (responseData.success) {
      // Validate response structure using schema
      const validatedResponse = CreateApiKeyResponseSchema.parse(
        responseData.data,
      );
      return validatedResponse;
    } else {
      // Handle error response with simple error message
      throw new Error(responseData.error.message || "API request failed");
    }
  }
}
