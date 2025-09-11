#!/usr/bin/env tsx

import { program } from "commander";
import { config } from "dotenv";
import { ImageUploader } from "@/lib/image-uploader";

// Load environment variables
config();

/**
 * Load base URL from environment variables
 */
function loadBaseURL(): string {
  const baseURL = process.env.CMS_BASE_URL;

  if (!baseURL) {
    throw new Error(
      `Missing CMS base URL. Please set CMS_BASE_URL in your .env file`,
    );
  }

  return baseURL;
}

/**
 * Load admin API key from environment variables
 */
function loadAdminAPIKey(): string {
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey) {
    throw new Error(
      `Missing admin API key. Please set ADMIN_API_KEY in your .env file`,
    );
  }

  return adminKey;
}

/**
 * Handle and display errors with user-friendly messages
 */
function handleError(error: unknown): void {
  console.error(`❌ Image upload failed:`);

  if (error instanceof Error) {
    console.error(`   ${error.message}`);

    // Provide specific guidance for common errors
    if (error.message.includes("Upload failed")) {
      console.error(`\n💡 Troubleshooting tips:`);
      console.error(`   - Check your ADMIN_API_KEY in .env file`);
      console.error(`   - Verify the CMS service is running and accessible`);
      console.error(`   - Ensure the image files exist and are readable`);
      console.error(
        `   - Check image file sizes (max 5MB) and formats (jpg/jpeg/png/gif/webp)`,
      );
    } else if (error.message.includes("File not found")) {
      console.error(`\n💡 Troubleshooting tips:`);
      console.error(`   - Check the file path is correct`);
      console.error(`   - Ensure the file exists in the content directory`);
      console.error(
        `   - File path should be relative to the content/ directory`,
      );
      console.error(`   - Example: site1/en/my-article.mdx`);
    } else if (error.message.includes("Image file not found")) {
      console.error(`\n💡 Troubleshooting tips:`);
      console.error(
        `   - Ensure all local images referenced in MDX actually exist`,
      );
      console.error(
        `   - Check image paths are relative to the MDX file location`,
      );
      console.error(`   - Verify image file permissions are readable`);
    } else if (
      error.message.includes("Missing CMS base URL") ||
      error.message.includes("Missing admin API key")
    ) {
      console.error(`\n💡 Troubleshooting tips:`);
      console.error(
        `   - Copy .env.example to .env and fill in your configuration`,
      );
      console.error(
        `   - Set CMS_BASE_URL to your API endpoint (e.g., https://api.example.com)`,
      );
      console.error(`   - Set ADMIN_API_KEY to your admin authentication key`);
      console.error(`   - Environment variable names are case-sensitive`);
    } else if (error.message.includes("Missing slug in MDX frontmatter")) {
      console.error(`\n💡 Troubleshooting tips:`);
      console.error(`   - Add 'slug' field to your MDX frontmatter`);
      console.error(`   - Example: slug: "my-article-slug"`);
      console.error(`   - Slug should be unique for each article`);
    } else if (error.message.includes("Invalid file path format")) {
      console.error(`\n💡 Troubleshooting tips:`);
      console.error(`   - Use format: siteId/language/filename.mdx`);
      console.error(`   - Example: site1/en/my-article.mdx`);
      console.error(`   - Supported languages: en, zh-CN`);
    }
  } else {
    console.error(`   ${String(error)}`);
  }
}

/**
 * Main upload function
 */
async function uploadImages(filePath: string): Promise<void> {
  try {
    console.log(`🚀 Starting image upload process...`);

    // Load configuration
    const baseURL = loadBaseURL();
    const adminKey = loadAdminAPIKey();

    console.log(`⚙️  Configuration loaded successfully`);

    // Create uploader instance
    const uploader = new ImageUploader(baseURL, adminKey);

    // Process the file
    await uploader.upload(filePath);

    console.log(`🎉 Image upload completed successfully!`);
    console.log(`\n📄 Next steps:`);
    console.log(`   1. Review the updated MDX file to verify image URLs`);
    console.log(
      `   2. You can now upload the blog using: pnpm run blogUpload ${filePath}`,
    );
  } catch (error) {
    handleError(error);
    throw error; // Re-throw for CLI to handle process.exit
  }
}

// CLI setup
program
  .name("imgUpload")
  .description(
    "Upload local images from MDX files to Cloudflare R2 and update image references",
  )
  .version("1.0.0")
  .argument(
    "<file-path>",
    "Path to MDX file (format: siteId/language/filename.mdx)",
  )
  .action(async (filePath: string) => {
    try {
      await uploadImages(filePath);
    } catch {
      process.exit(1);
    }
  });

// Add help examples
program.addHelpText(
  "after",
  `

Examples:
  $ pnpm run imgUpload site1/en/my-first-post.mdx
  $ pnpm run imgUpload mysite/zh-CN/chinese-article.mdx

The script will:
  1. Parse the MDX file and extract local image references
  2. Upload each local image to Cloudflare R2 storage
  3. Replace local image paths with R2 URLs in the MDX content
  4. Save the updated MDX file

Environment Variables Required:
  CMS_BASE_URL     - Base URL of your CMS API (e.g., https://api.example.com)
  ADMIN_API_KEY    - Admin authentication key for image upload API

Supported Image Formats:
  - JPG/JPEG (up to 5MB)
  - PNG (up to 5MB) 
  - GIF (up to 5MB)
  - WebP (up to 5MB)

Note: This script processes LOCAL images only. Remote images (HTTP/HTTPS URLs) are left unchanged.
`,
);

// Only run CLI when this file is executed directly, not when imported
if (require.main === module) {
  program.parse();
}
