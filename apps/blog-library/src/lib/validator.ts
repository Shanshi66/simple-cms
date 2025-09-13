import { z } from "zod";
import {
  ArticleMetadataInput,
  ArticleMetadataSchema,
  SLUG_REGEX,
  DATE_REGEX,
  ArticleStatus,
} from "@repo/types/api";

export class ValidationError extends Error {
  public field?: string;
  public code: string;

  constructor(message: string, options: { code: string; field?: string }) {
    super(message);
    this.name = "ValidationError";
    this.code = options.code;
    this.field = options.field;
  }
}

export class Validator {
  /**
   * Validate article metadata using Zod schema
   */
  static validateArticleMetadata(
    metadata: unknown,
  ): asserts metadata is ArticleMetadataInput {
    try {
      ArticleMetadataSchema.parse(metadata);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map(
          (issue) => `${issue.path.join(".")}: ${issue.message}`,
        );
        throw new ValidationError(
          `Metadata validation failed: ${issues.join(", ")}`,
          {
            code: "METADATA_VALIDATION_ERROR",
            field: "metadata",
          },
        );
      }
      throw error;
    }
  }

  /**
   * Validate slug format
   */
  static validateSlug(slug: string): boolean {
    return SLUG_REGEX.test(slug);
  }

  /**
   * Validate date format
   */
  static validateDate(date: string): boolean {
    return DATE_REGEX.test(date);
  }

  /**
   * Validate article status
   */
  static validateStatus(status: string): status is ArticleStatus {
    return Object.values(ArticleStatus).includes(status as ArticleStatus);
  }
}
