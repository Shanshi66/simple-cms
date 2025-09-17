#!/usr/bin/env tsx

import { program } from "commander";
import { config } from "dotenv";
import { APIClient } from "@/lib/api-client";
import { CreateSiteRequest } from "@repo/types/api";
import { loadConfig } from "@/lib/config";

// Load environment variables
config();

export class SiteCreator {
  private config: { baseURL: string; apiKey: string };

  constructor() {
    // Load configuration during class initialization
    this.config = loadConfig();
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
   * Create a new site
   */
  async createSite(name: string, description?: string): Promise<void> {
    try {
      console.log(`🚀 Creating site: ${name}`);

      // Validate site name format
      this.validateSiteName(name);
      console.log(`✅ Site name validation passed`);

      console.log(`⚙️ Using loaded configuration`);

      // Prepare site data
      const siteData: CreateSiteRequest = {
        name,
        description,
      };

      // Create API client and create site
      console.log(`🌐 Creating site via API...`);
      const apiClient = new APIClient(this.config.baseURL, this.config.apiKey);
      const response = await apiClient.createSite(siteData);

      console.log(`✅ Site created successfully!`);
      console.log(`📄 Site ID: ${response.id}`);
      console.log(`📝 Name: ${response.name}`);
      if (response.description) {
        console.log(`📋 Description: ${response.description}`);
      }
      console.log(`📅 Created at: ${response.created_at}`);
    } catch (error) {
      this.handleError(error);
      throw error; // Re-throw for testing, CLI will handle process.exit
    }
  }

  /**
   * Handle and display errors with user-friendly messages
   */
  private handleError(error: unknown): void {
    console.error(`❌ Site creation failed:`);

    if (error instanceof Error) {
      console.error(`   ${error.message}`);

      // Provide specific guidance for common errors
      if (error.message.includes("API request failed")) {
        console.error(`\n💡 Troubleshooting tips:`);
        console.error(
          `   - Check your ADMIN_API_KEY and CMS_BASE_URL in .env file`,
        );
        console.error(`   - Verify the API endpoint is accessible`);
        console.error(`   - Ensure the site name doesn't already exist`);
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
      }
    } else {
      console.error(`   ${String(error)}`);
    }
  }

  // Test helper methods (only used in testing)
  public testLoadConfig() {
    return this.config;
  }

  public testValidateSiteName(name: string): void {
    return this.validateSiteName(name);
  }
}

// CLI setup
program
  .name("createSite")
  .description("Create a new site in the CMS")
  .version("1.0.0")
  .argument(
    "<site-name>",
    "Name of the site to create (letters and hyphens only)",
  )
  .argument("[description]", "Optional description for the site")
  .action(async (siteName: string, description?: string) => {
    const creator = new SiteCreator();
    try {
      await creator.createSite(siteName, description);
    } catch {
      process.exit(1);
    }
  });

// Only run CLI when this file is executed directly, not when imported
if (require.main === module) {
  program.parse();
}
