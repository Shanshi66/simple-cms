import { z } from "zod";
import {
  ArticleMetadataInput,
  ArticleMetadataSchema,
  SLUG_REGEX,
  DATE_REGEX,
  ArticleStatus,
} from "@repo/types/cms";

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

  /**
   * Validate individual field with detailed error
   */
  static validateField(field: string, value: unknown, fieldName: string): void {
    switch (fieldName) {
      case "slug":
        if (typeof value !== "string" || !this.validateSlug(value)) {
          throw new ValidationError(
            "Slug must contain only lowercase letters, numbers, and hyphens",
            { code: "INVALID_SLUG", field: fieldName },
          );
        }
        break;
      case "date":
        if (typeof value !== "string" || !this.validateDate(value)) {
          throw new ValidationError("Date must be in YYYY-MM-DD format", {
            code: "INVALID_DATE",
            field: fieldName,
          });
        }
        break;
      case "status":
        if (typeof value !== "string" || !this.validateStatus(value)) {
          throw new ValidationError(
            "Status must be either 'draft' or 'published'",
            { code: "INVALID_STATUS", field: fieldName },
          );
        }
        break;
      case "title":
        if (typeof value !== "string" || value.trim().length === 0) {
          throw new ValidationError("Title is required and cannot be empty", {
            code: "INVALID_TITLE",
            field: fieldName,
          });
        }
        break;
      case "excerpt":
        if (typeof value !== "string" || value.trim().length === 0) {
          throw new ValidationError("Excerpt is required and cannot be empty", {
            code: "INVALID_EXCERPT",
            field: fieldName,
          });
        }
        break;
      default:
        throw new ValidationError(`Unknown field: ${fieldName}`, {
          code: "UNKNOWN_FIELD",
          field: fieldName,
        });
    }
  }
}
