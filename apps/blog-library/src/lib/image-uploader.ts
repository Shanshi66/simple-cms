import { readFile, writeFile, existsSync } from "fs-extra";
import path from "path";
import fetch from "node-fetch";
import { createReadStream } from "fs";
import { MDXParser } from "./mdx-parser";
import { parseFilePath, type PathInfo } from "./path-utils";
import FormData from "form-data";
import { ApiResponse, ImageUploadSuccessData } from "@repo/types/api";

interface UploadResult {
  localPath: string;
  r2Url: string;
}

export class ImageUploader {
  private baseURL: string;
  private adminKey: string;
  private mdxParser: MDXParser;

  constructor(baseURL: string, adminKey: string) {
    if (!baseURL || !adminKey) {
      throw new Error("Base URL and Admin API key are required");
    }
    this.baseURL = baseURL.replace(/\/$/, ""); // Remove trailing slash
    this.adminKey = adminKey;
    this.mdxParser = new MDXParser();
  }

  /**
   * Extract local image paths from MDX content
   */
  private extractLocalImages(
    content: string,
    mdxFilePath: string,
  ): { original: string; resolved: string }[] {
    // Match Markdown image syntax: ![alt](path)
    const imageRegex = /!\[.*?\]\(([^)]+)\)/g;
    const localImages: { original: string; resolved: string }[] = [];
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      const imagePath = match[1];
      if (!imagePath) continue;

      // Only process local images (not HTTP URLs or protocol-relative URLs)
      if (!imagePath.startsWith("http") && !imagePath.startsWith("//")) {
        // Resolve relative paths relative to the MDX file location
        let resolvedPath: string;
        if (path.isAbsolute(imagePath)) {
          resolvedPath = imagePath;
        } else {
          const mdxDir = path.dirname(mdxFilePath);
          resolvedPath = path.resolve(mdxDir, imagePath);
        }
        localImages.push({ original: imagePath, resolved: resolvedPath });
      }
    }

    // Return unique images based on resolved path
    const uniqueImages = localImages.filter(
      (img, index, self) =>
        self.findIndex((other) => other.resolved === img.resolved) === index,
    );

    return uniqueImages;
  }

  /**
   * Extract metadata from parsed MDX
   */
  private extractMetadata(
    metadata: Record<string, unknown>,
    pathInfo: PathInfo,
  ): { siteName: string; slug: string } {
    // Use siteName from file path and slug from frontmatter
    const siteName = pathInfo.siteName;
    const slug = metadata.slug as string;

    if (!slug) {
      throw new Error("Missing slug in MDX frontmatter");
    }

    return { siteName, slug };
  }

  /**
   * Upload a single image to the backend API
   */
  private async uploadSingleImage(
    imagePath: string,
    siteName: string,
    postSlug: string,
  ): Promise<string> {
    if (!existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    const formData = new FormData();

    formData.append("image", createReadStream(imagePath));
    formData.append("siteName", siteName);
    formData.append("postSlug", postSlug);

    const url = `${this.baseURL}/image/upload`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.adminKey}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Upload failed (${response.status}): ${
          errorText || response.statusText
        }`,
      );
    }

    const result =
      (await response.json()) as ApiResponse<ImageUploadSuccessData>;

    if (result.success && result.data) {
      return result.data.url;
    } else {
      throw new Error("Upload failed with unknown error");
    }
  }

  /**
   * Upload all local images and return mapping of local paths to R2 URLs
   */
  private async uploadImages(
    localImages: { original: string; resolved: string }[],
    siteName: string,
    slug: string,
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (const image of localImages) {
      try {
        console.log(`📤 Uploading: ${image.original}`);
        const r2Url = await this.uploadSingleImage(
          image.resolved,
          siteName,
          slug,
        );

        results.push({
          localPath: image.original, // Use original path for replacement
          r2Url,
        });

        console.log(`✅ Uploaded: ${image.original} -> ${r2Url}`);
      } catch (error) {
        console.error(`❌ Failed to upload ${image.original}:`, error);
        throw error; // Stop on first failure for atomic operation
      }
    }

    return results;
  }

  /**
   * Main upload method: process MDX file and upload all local images
   */
  async upload(filePath: string): Promise<void> {
    console.log(`🖼️  Processing images in: ${filePath}`);

    try {
      // Parse file path
      const pathInfo = parseFilePath(filePath);
      console.log(
        `🔍 Detected: Site="${pathInfo.siteName}", Language="${pathInfo.language}"`,
      );

      // Check if file exists
      if (!existsSync(pathInfo.fullPath)) {
        throw new Error(`File not found: ${pathInfo.fullPath}`);
      }

      // Parse MDX file
      console.log(`📖 Parsing MDX file...`);
      const parseResult = await this.mdxParser.parse(pathInfo.fullPath);
      const content = await readFile(pathInfo.fullPath, "utf-8");

      // Extract metadata
      const { siteName, slug } = this.extractMetadata(
        parseResult.metadata,
        pathInfo,
      );

      // Extract local images
      const localImages = this.extractLocalImages(content, pathInfo.fullPath);

      if (localImages.length === 0) {
        console.log(`ℹ️  No local images found in ${filePath}`);
        return;
      }

      console.log(`📊 Found ${localImages.length} local image(s) to upload:`);
      localImages.forEach((img) => console.log(`   - ${img.original}`));

      // Upload images and get R2 URLs
      const uploadResults = await this.uploadImages(
        localImages,
        siteName,
        slug,
      );

      // Replace local paths with R2 URLs
      let updatedContent = content;
      for (const result of uploadResults) {
        // Use global replace to handle multiple occurrences of the same image
        updatedContent = updatedContent.replace(
          new RegExp(this.escapeRegExp(result.localPath), "g"),
          result.r2Url,
        );
      }

      // Save updated file
      await writeFile(pathInfo.fullPath, updatedContent, "utf-8");

      console.log(
        `✅ Successfully processed ${uploadResults.length} images in ${filePath}`,
      );
    } catch (error) {
      console.error(`❌ Image upload failed:`);
      if (error instanceof Error) {
        console.error(`   ${error.message}`);
      } else {
        console.error(`   ${String(error)}`);
      }
      throw error;
    }
  }

  /**
   * Escape special regex characters in a string
   */
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Test helper methods (only used in testing)
  public testParseFilePath(filePath: string) {
    return parseFilePath(filePath);
  }

  public testExtractLocalImages(
    content: string,
    mdxFilePath: string,
  ): { original: string; resolved: string }[] {
    return this.extractLocalImages(content, mdxFilePath);
  }

  public testExtractMetadata(
    metadata: Record<string, unknown>,
    pathInfo: PathInfo,
  ) {
    return this.extractMetadata(metadata, pathInfo);
  }
}
