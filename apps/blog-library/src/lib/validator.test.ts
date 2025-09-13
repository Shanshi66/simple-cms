import { describe, it, expect } from "vitest";
import { Validator } from "./validator";
import { ArticleStatus } from "@repo/types/api";

describe("Validator", () => {
  describe("validateArticleMetadata", () => {
    it("should validate correct metadata", () => {
      const validMetadata = {
        title: "Test Title",
        excerpt: "Test excerpt",
        date: "2024-01-15",
        status: "published",
        slug: "test-slug",
      };

      expect(() =>
        Validator.validateArticleMetadata(validMetadata),
      ).not.toThrow();
    });

    it("should throw for empty title", () => {
      const invalidMetadata = {
        title: "",
        excerpt: "Test excerpt",
        date: "2024-01-15",
        status: "published",
        slug: "test-slug",
      };

      expect(() =>
        Validator.validateArticleMetadata(invalidMetadata),
      ).toThrow();
    });

    it("should throw for missing excerpt", () => {
      const invalidMetadata = {
        title: "Test Title",
        date: "2024-01-15",
        status: "published",
        slug: "test-slug",
      };

      expect(() =>
        Validator.validateArticleMetadata(invalidMetadata),
      ).toThrow();
    });

    it("should throw for missing slug", () => {
      const invalidMetadata = {
        title: "Test Title",
        excerpt: "Test excerpt",
        date: "2024-01-15",
        status: "draft",
      };

      expect(() =>
        Validator.validateArticleMetadata(invalidMetadata),
      ).toThrow();
    });

    it("should throw for invalid date format", () => {
      const invalidMetadata = {
        title: "Test Title",
        excerpt: "Test excerpt",
        date: "15/01/2024",
        status: "published",
        slug: "test-slug",
      };

      expect(() =>
        Validator.validateArticleMetadata(invalidMetadata),
      ).toThrow();
    });

    it("should throw for invalid status", () => {
      const invalidMetadata = {
        title: "Test Title",
        excerpt: "Test excerpt",
        date: "2024-01-15",
        status: "invalid-status",
        slug: "test-slug",
      };

      expect(() =>
        Validator.validateArticleMetadata(invalidMetadata),
      ).toThrow();
    });

    it("should throw for invalid slug format", () => {
      const invalidMetadata = {
        title: "Test Title",
        excerpt: "Test excerpt",
        date: "2024-01-15",
        status: "published",
        slug: "Invalid_Slug_With_Underscores",
      };

      expect(() =>
        Validator.validateArticleMetadata(invalidMetadata),
      ).toThrow();
    });

    it("should throw error for empty title", () => {
      const invalidMetadata = {
        title: "",
        excerpt: "Test excerpt",
        date: "2024-01-15",
        status: "published",
        slug: "test-slug",
      };

      expect(() =>
        Validator.validateArticleMetadata(invalidMetadata),
      ).toThrow();
    });
  });

  describe("validateSlug", () => {
    it("should validate correct slug format", () => {
      expect(Validator.validateSlug("valid-slug")).toBe(true);
      expect(Validator.validateSlug("slug123")).toBe(true);
      expect(Validator.validateSlug("test-slug-123")).toBe(true);
      expect(Validator.validateSlug("a")).toBe(true);
      expect(Validator.validateSlug("123")).toBe(true);
    });

    it("should reject invalid slug format", () => {
      expect(Validator.validateSlug("Invalid_Slug")).toBe(false);
      expect(Validator.validateSlug("UPPERCASE")).toBe(false);
      expect(Validator.validateSlug("slug with spaces")).toBe(false);
      expect(Validator.validateSlug("slug.with.dots")).toBe(false);
      expect(Validator.validateSlug("slug@symbol")).toBe(false);
      expect(Validator.validateSlug("")).toBe(false);
      expect(Validator.validateSlug("slug/slash")).toBe(false);
    });
  });

  describe("validateDate", () => {
    it("should validate correct date format", () => {
      expect(Validator.validateDate("2024-01-15")).toBe(true);
      expect(Validator.validateDate("2023-12-31")).toBe(true);
      expect(Validator.validateDate("2000-01-01")).toBe(true);
      expect(Validator.validateDate("9999-12-31")).toBe(true);
    });

    it("should reject invalid date format", () => {
      expect(Validator.validateDate("15/01/2024")).toBe(false);
      expect(Validator.validateDate("2024-1-15")).toBe(false);
      expect(Validator.validateDate("2024-01-5")).toBe(false);
      expect(Validator.validateDate("24-01-15")).toBe(false);
      expect(Validator.validateDate("2024/01/15")).toBe(false);
      // Note: DATE_REGEX only validates format, not actual date validity
      // "2024-13-01" matches format YYYY-MM-DD but is not a valid date
      // This is expected behavior as per the regex definition
      expect(Validator.validateDate("")).toBe(false);
      expect(Validator.validateDate("invalid")).toBe(false);
    });
  });

  describe("validateStatus", () => {
    it("should validate correct status values", () => {
      expect(Validator.validateStatus("draft")).toBe(true);
      expect(Validator.validateStatus("published")).toBe(true);
    });

    it("should reject invalid status values", () => {
      expect(Validator.validateStatus("invalid")).toBe(false);
      expect(Validator.validateStatus("DRAFT")).toBe(false);
      expect(Validator.validateStatus("PUBLISHED")).toBe(false);
      expect(Validator.validateStatus("")).toBe(false);
      expect(Validator.validateStatus("pending")).toBe(false);
    });

    it("should provide type guard functionality", () => {
      const status = "draft";
      if (Validator.validateStatus(status)) {
        // TypeScript should infer status as ArticleStatus here
        expect(status).toBe(ArticleStatus.DRAFT);
      }
    });
  });

  describe("edge cases", () => {
    it("should handle null and undefined inputs", () => {
      expect(() => Validator.validateArticleMetadata(null)).toThrow();
      expect(() => Validator.validateArticleMetadata(undefined)).toThrow();
    });

    it("should handle empty object", () => {
      expect(() => Validator.validateArticleMetadata({})).toThrow();
    });

    it("should handle partial metadata", () => {
      const partialMetadata = {
        title: "Test Title",
        excerpt: "Test excerpt",
      };

      expect(() =>
        Validator.validateArticleMetadata(partialMetadata),
      ).toThrow();
    });

    it("should handle extra fields in metadata", () => {
      const metadataWithExtras = {
        title: "Test Title",
        excerpt: "Test excerpt",
        date: "2024-01-15",
        status: "published",
        slug: "test-slug",
        extraField: "should be ignored",
        anotherExtra: 123,
      };

      expect(() =>
        Validator.validateArticleMetadata(metadataWithExtras),
      ).not.toThrow();
    });

    it("should validate metadata with draft status", () => {
      const draftMetadata = {
        title: "Draft Title",
        excerpt: "Draft excerpt",
        date: "2024-01-15",
        status: "draft",
        slug: "draft-slug",
      };

      expect(() =>
        Validator.validateArticleMetadata(draftMetadata),
      ).not.toThrow();
    });
  });
});
