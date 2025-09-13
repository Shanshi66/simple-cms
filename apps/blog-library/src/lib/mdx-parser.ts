import { readFile } from "fs-extra";
import matter from "gray-matter";
import { compile } from "@mdx-js/mdx";
import { ArticleMetadataInput } from "@repo/types/api";
import { ParseResult } from "@/types/article";
import { Validator, ValidationError } from "./validator";

export class MDXParser {
  /**
   * Parse MDX file and extract metadata and content
   */
  async parse(filePath: string): Promise<ParseResult> {
    // Read file content
    const fileContent = await readFile(filePath, "utf-8");

    // Parse front matter using gray-matter
    const { data: frontMatter, content } = matter(fileContent);

    // Validate metadata using schema
    this.validateMetadata(frontMatter);

    // Validate MDX format
    await this.validateMDX(content);

    // validateMetadata ensures frontMatter is ArticleMetadataInput
    const metadata = frontMatter;

    return {
      metadata,
      content,
    };
  }

  /**
   * Validate front matter metadata
   */
  validateMetadata(
    metadata: unknown,
  ): asserts metadata is ArticleMetadataInput {
    Validator.validateArticleMetadata(metadata);
  }

  /**
   * Validate MDX format by attempting compilation
   */
  async validateMDX(content: string): Promise<boolean> {
    try {
      await compile(content, {
        format: "mdx",
        development: false,
      });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new ValidationError(`MDX syntax error: ${message}`, {
        code: "MDX_SYNTAX_ERROR",
        field: "content",
      });
    }
  }
}
