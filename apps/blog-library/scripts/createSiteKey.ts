#!/usr/bin/env tsx

import { program } from "commander";
import { config } from "dotenv";
import { APIClient } from "@/lib/api-client";
import { CreateApiKeyRequest } from "@repo/types/api";

// Load environment variables
config();

// Strict ISO 8601 datetime regex that requires milliseconds
const STRICT_ISO_DATETIME_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export class SiteKeyCreator {
  constructor() {
    // Initialize SiteKeyCreator
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfig() {
    const baseURL = process.env.CMS_BASE_URL;
    const apiKey = process.env.ADMIN_API_KEY;

    if (!baseURL) {
      throw new Error(
        `Missing CMS base URL. Please set CMS_BASE_URL in your .env file`,
      );
    }

    if (!apiKey) {
      throw new Error(
        `Missing admin API key. Please set ADMIN_API_KEY in your .env file`,
      );
    }

    return { baseURL, apiKey };
  }

  /**
   * Validate site name format (only letters and '-')
   */
  private validateSiteName(name: string): void {
    // Site name must:
    // - Not be empty
    // - Only contain letters and hyphens
    // - Not start or end with hyphens
    const siteNameRegex = /^[a-zA-Z]([a-zA-Z-]*[a-zA-Z])?$/;
    if (!name || !siteNameRegex.test(name)) {
      throw new Error(
        `Site name can only contain letters and hyphens. Got: "${name}"`,
      );
    }
  }

  /**
   * Validate expires-at format (ISO 8601)
   */
  private validateExpiresAt(expiresAt: string): void {
    if (!expiresAt || !STRICT_ISO_DATETIME_REGEX.test(expiresAt)) {
      throw new Error(
        `Expires-at must be a valid ISO 8601 datetime (e.g., "2024-12-31T23:59:59.000Z"). Got: "${expiresAt}"`,
      );
    }

    // Check if the date is actually parseable and valid
    const expirationDate = new Date(expiresAt);
    if (isNaN(expirationDate.getTime())) {
      throw new Error(
        `Expires-at must be a valid ISO 8601 datetime (e.g., "2024-12-31T23:59:59.000Z"). Got: "${expiresAt}"`,
      );
    }

    // Check if the date is in the future
    const now = new Date();
    if (expirationDate <= now) {
      throw new Error(`Expires-at must be a future date. Got: "${expiresAt}"`);
    }
  }

  /**
   * Create a new API key for a site
   */
  async createSiteKey(
    siteName: string,
    keyName: string,
    expiresAt?: string,
  ): Promise<void> {
    try {
      console.log(`🚀 Creating API key "${keyName}" for site: ${siteName}`);

      // Validate site name format
      this.validateSiteName(siteName);
      console.log(`✅ Site name validation passed`);

      // Validate expiration date if provided
      if (expiresAt !== undefined) {
        this.validateExpiresAt(expiresAt);
        console.log(`✅ Expiration date validation passed`);
      }

      // Load configuration
      const config = this.loadConfig();
      console.log(`⚙️ Loaded configuration`);

      // Prepare API key data
      const keyData: CreateApiKeyRequest = {
        name: keyName,
        expiresAt,
      };

      // Create API client and create site API key
      console.log(`🌐 Creating API key via API...`);
      const apiClient = new APIClient(config.baseURL, config.apiKey);
      const response = await apiClient.createSiteApiKey(siteName, keyData);

      console.log(`✅ API key created successfully!`);
      console.log(`📄 Key ID: ${response.id}`);
      console.log(`📝 Key Name: ${response.name}`);
      console.log(`🏢 Site ID: ${response.siteId}`);
      if (response.expiresAt) {
        console.log(`⏰ Expires At: ${response.expiresAt}`);
      } else {
        console.log(`⏰ Expires At: Never`);
      }
      console.log(`📅 Created At: ${response.createdAt}`);

      // Display API key with security warning
      console.log(`\n⚠️ IMPORTANT SECURITY WARNING ⚠️`);
      console.log(`🔑 API Key: ${response.apiKey}`);
      console.log(
        `⚠️ This API key will only be displayed once for security reasons.`,
      );
      console.log(
        `⚠️ Please save it securely now. You will not be able to retrieve it again.`,
      );
    } catch (error) {
      this.handleError(error);
      throw error; // Re-throw for testing, CLI will handle process.exit
    }
  }

  /**
   * Handle and display errors with user-friendly messages
   */
  private handleError(error: unknown): void {
    console.error(`❌ API key creation failed:`);

    if (error instanceof Error) {
      console.error(`   ${error.message}`);

      // Provide specific guidance for common errors
      if (error.message.includes("API request failed")) {
        console.error(`\n💡 Troubleshooting tips:`);
        console.error(
          `   - Check your ADMIN_API_KEY and CMS_BASE_URL in .env file`,
        );
        console.error(`   - Verify the API endpoint is accessible`);
        console.error(`   - Ensure the site name exists`);
        console.error(`   - Check if the API key name is unique for this site`);
      } else if (
        error.message.includes("Missing admin API key") ||
        error.message.includes("Missing CMS base URL")
      ) {
        console.error(`\n💡 Troubleshooting tips:`);
        console.error(
          `   - Copy .env.example to .env and fill in your configuration`,
        );
        console.error(`   - Environment variable names are case-sensitive`);
        console.error(`   - Set ADMIN_API_KEY for admin authentication`);
        console.error(`   - Set CMS_BASE_URL for the API endpoint`);
      } else if (error.message.includes("Site name can only contain")) {
        console.error(`\n💡 Troubleshooting tips:`);
        console.error(
          `   - Site names can only contain letters (a-z, A-Z) and hyphens (-)`,
        );
        console.error(`   - Examples: "my-blog", "personal-site", "portfolio"`);
        console.error(`   - Invalid: "my_blog", "site123", "blog.com"`);
      } else if (
        error.message.includes("Expires-at must be a valid ISO 8601")
      ) {
        console.error(`\n💡 Troubleshooting tips:`);
        console.error(`   - Use ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ`);
        console.error(
          `   - Examples: "2024-12-31T23:59:59.000Z", "2025-06-15T12:00:00.000Z"`,
        );
        console.error(`   - Use a future date for expiration`);
      } else if (error.message.includes("Expires-at must be a future date")) {
        console.error(`\n💡 Troubleshooting tips:`);
        console.error(`   - The expiration date must be in the future`);
        console.error(`   - Check your system clock is correct`);
        console.error(`   - Use a date at least a few minutes from now`);
      }
    } else {
      console.error(`   ${String(error)}`);
    }
  }

  // Test helper methods (only used in testing)
  public testLoadConfig() {
    return this.loadConfig();
  }

  public testValidateSiteName(name: string): void {
    return this.validateSiteName(name);
  }

  public testValidateExpiresAt(expiresAt: string): void {
    return this.validateExpiresAt(expiresAt);
  }
}

// CLI setup
program
  .name("createSiteKey")
  .description("Create a new API key for a site in the CMS")
  .version("1.0.0")
  .argument(
    "<site-name>",
    "Name of the site to create API key for (letters and hyphens only)",
  )
  .argument("<key-name>", "Name of the API key to create")
  .argument(
    "[expires-at]",
    "Optional expiration date in ISO 8601 format (e.g., 2024-12-31T23:59:59.000Z)",
  )
  .action(async (siteName: string, keyName: string, expiresAt?: string) => {
    const creator = new SiteKeyCreator();
    try {
      await creator.createSiteKey(siteName, keyName, expiresAt);
    } catch {
      process.exit(1);
    }
  });

// Only run CLI when this file is executed directly, not when imported
if (require.main === module) {
  program.parse();
}
