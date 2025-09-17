#!/usr/bin/env tsx

import { program } from "commander";
import { config } from "dotenv";
import { existsSync } from "fs-extra";
import { MDXParser } from "@/lib/mdx-parser";
import { APIClient } from "@/lib/api-client";
import { ValidationError } from "@/lib/validator";
import { parseFilePath } from "@/lib/path-utils";
import { CreateArticleRequest } from "@repo/types/api";
import { SiteConfig } from "@/types/article";
import { loadConfig } from "@/lib/config";

// Load environment variables
config();

export class BlogUploader {
  private mdxParser: MDXParser;
  private config: { baseURL: string; apiKey: string };

  constructor() {
    this.mdxParser = new MDXParser();
    // Load configuration during class initialization
    this.config = loadConfig();
  }

  /**
   * Load site configuration using stored config
   */
  private loadSiteConfig(siteName: string): SiteConfig {
    return {
      name: siteName,
      apiKey: this.config.apiKey,
    };
  }

  /**
   * Upload blog article
   */
  async upload(filePath: string): Promise<void> {
    try {
      console.log(`📝 Processing blog upload: ${filePath}`);

      // Parse file path
      const pathInfo = parseFilePath(filePath);
      console.log(
        `🔍 Detected: Site="${pathInfo.siteName}", Language="${pathInfo.language}"`,
      );

      // Check if file exists
      if (!existsSync(pathInfo.fullPath)) {
        throw new Error(`File not found: ${pathInfo.fullPath}`);
      }

      // Load site configuration using stored config
      const siteConfig = this.loadSiteConfig(pathInfo.siteName);
      console.log(
        `⚙️  Using loaded configuration for site "${pathInfo.siteName}"`,
      );

      // Parse MDX file
      console.log(`📖 Parsing MDX file...`);
      const parseResult = await this.mdxParser.parse(pathInfo.fullPath);

      // Check for local images before proceeding
      console.log(`🔍 Checking for local image references...`);
      const hasLocalImages = this.checkLocalImages(parseResult.content);
      if (hasLocalImages) {
        throw new Error(
          `Found local images in ${filePath}. Please run 'pnpm run imgUpload ${filePath}' first to upload images to R2.`,
        );
      }

      // Use slug from metadata (required field)
      const slug = parseResult.metadata.slug;
      console.log(`🏷️  Using slug: "${slug}"`);

      // Prepare article data
      const articleData: CreateArticleRequest = {
        language: pathInfo.language,
        slug,
        title: parseResult.metadata.title,
        excerpt: parseResult.metadata.excerpt,
        date: parseResult.metadata.date,
        status: parseResult.metadata.status,
        content: parseResult.content,
      };

      console.log(`📊 Article metadata validated successfully`);

      // Create API client and upload article
      console.log(`🚀 Uploading article to API...`);
      const apiClient = new APIClient(this.config.baseURL, siteConfig.apiKey);
      const response = await apiClient.createArticle(
        siteConfig.name,
        articleData,
      );

      console.log(`✅ Article created successfully!`);
      console.log(`📄 Article ID: ${response.id}`);
      console.log(`💬 Message: ${response.message}`);
    } catch (error) {
      this.handleError(error);
      throw error; // Re-throw for testing, CLI will handle process.exit
    }
  }

  /**
   * Check if the content contains local image references
   */
  private checkLocalImages(content: string): boolean {
    const imageRegex = /!\[.*?\]\(([^)]+)\)/g;
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      const imagePath = match[1];
      if (!imagePath) continue;
      // Check if it's a local image path (not HTTP or protocol-relative URL)
      if (!imagePath.startsWith("http") && !imagePath.startsWith("//")) {
        return true;
      }
    }

    return false;
  }

  /**
   * Handle and display errors with user-friendly messages
   */
  private handleError(error: unknown): void {
    console.error(`❌ Upload failed:`);

    if (error instanceof ValidationError) {
      console.error(`🔍 Validation Error (${error.code}):`);
      console.error(`   ${error.message}`);
      if (error.field) {
        console.error(`   Field: ${error.field}`);
      }
    } else if (error instanceof Error) {
      console.error(`   ${error.message}`);

      // Provide specific guidance for common errors
      if (error.message.includes("API request failed")) {
        console.error(`\n💡 Troubleshooting tips:`);
        console.error(
          `   - Check your ADMIN_API_KEY and base URL in .env file`,
        );
        console.error(`   - Verify the site ID exists in the backend`);
        console.error(
          `   - Ensure the article slug is unique for this site and language`,
        );
      } else if (error.message.includes("File not found")) {
        console.error(`\n💡 Troubleshooting tips:`);
        console.error(`   - Check the file path is correct`);
        console.error(`   - Ensure the file exists in the content directory`);
        console.error(`   - File should be relative to the content/ directory`);
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
        console.error(
          `   - Make sure to set CMS_BASE_URL for the shared API endpoint`,
        );
      }
    } else {
      console.error(`   ${String(error)}`);
    }
  }

  // Test helper methods (only used in testing)
  public testParseFilePath(filePath: string) {
    return parseFilePath(filePath);
  }

  public testLoadSiteConfig(siteName: string) {
    return this.loadSiteConfig(siteName);
  }

  public testLoadConfig() {
    return this.config;
  }

  public testCheckLocalImages(content: string): boolean {
    return this.checkLocalImages(content);
  }
}

// CLI setup
program
  .name("blogUpload")
  .description("Upload blog articles to CMS via API")
  .version("1.0.0")
  .argument(
    "<file-path>",
    "Path to MDX file (format: siteName/language/filename.mdx)",
  )
  .action(async (filePath: string) => {
    const uploader = new BlogUploader();
    try {
      await uploader.upload(filePath);
    } catch {
      process.exit(1);
    }
  });

// Only run CLI when this file is executed directly, not when imported
if (require.main === module) {
  program.parse();
}
