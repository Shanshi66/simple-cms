import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFile, remove, ensureDir } from "fs-extra";
import path from "path";
import { MDXParser } from "./mdx-parser";
import { ArticleStatus } from "@repo/types/api";

describe("MDXParser", () => {
  let parser: MDXParser;
  let testDir: string;

  beforeEach(async () => {
    parser = new MDXParser();
    testDir = path.join(__dirname, "../..", "test-fixtures");
    await ensureDir(testDir);
  });

  afterEach(async () => {
    // Clean up test files
    await remove(testDir);
  });

  describe("parse", () => {
    it("should parse valid MDX file with all required fields", async () => {
      const validMdxContent = `---
title: "Test Article"
excerpt: "This is a test article excerpt"
date: "2024-01-15"
status: "published"
slug: "test-article"
---

# Test Article

This is the content of the test article.

## Section 1

Some content here.
`;

      const filePath = path.join(testDir, "valid-article.mdx");
      await writeFile(filePath, validMdxContent);

      const result = await parser.parse(filePath);

      expect(result.metadata).toEqual({
        title: "Test Article",
        excerpt: "This is a test article excerpt",
        date: "2024-01-15",
        status: "published",
        slug: "test-article",
      });
      expect(result.content).toContain("# Test Article");
      expect(result.content).toContain("This is the content");
    });

    it("should throw error for missing slug field", async () => {
      const mdxWithoutSlug = `---
title: "Test Article"
excerpt: "This is a test article excerpt"
date: "2024-01-15"
status: "draft"
---

# Test Article

Content here.
`;

      const filePath = path.join(testDir, "missing-slug.mdx");
      await writeFile(filePath, mdxWithoutSlug);

      await expect(parser.parse(filePath)).rejects.toThrow();
    });

    it("should handle draft status", async () => {
      const draftContent = `---
title: "Draft Article"
excerpt: "This is a draft article"
date: "2024-01-15"
status: "draft"
slug: "draft-article"
---

# Draft Content
`;

      const filePath = path.join(testDir, "draft.mdx");
      await writeFile(filePath, draftContent);

      const result = await parser.parse(filePath);

      expect(result.metadata.status).toBe(ArticleStatus.DRAFT);
    });

    it("should throw error for missing file", async () => {
      const nonExistentPath = path.join(testDir, "non-existent.mdx");

      await expect(parser.parse(nonExistentPath)).rejects.toThrow();
    });

    it("should throw error for missing required fields", async () => {
      const invalidContent = `---
title: "Test Article"
# missing excerpt, date, and status
---

# Content
`;

      const filePath = path.join(testDir, "invalid.mdx");
      await writeFile(filePath, invalidContent);

      await expect(parser.parse(filePath)).rejects.toThrow();
    });

    it("should throw error for invalid date format", async () => {
      const invalidDateContent = `---
title: "Test Article"
excerpt: "Test excerpt"
date: "15/01/2024"
status: "published"
---

# Content
`;

      const filePath = path.join(testDir, "invalid-date.mdx");
      await writeFile(filePath, invalidDateContent);

      await expect(parser.parse(filePath)).rejects.toThrow();
    });

    it("should throw error for invalid status", async () => {
      const invalidStatusContent = `---
title: "Test Article"
excerpt: "Test excerpt"
date: "2024-01-15"
status: "invalid-status"
---

# Content
`;

      const filePath = path.join(testDir, "invalid-status.mdx");
      await writeFile(filePath, invalidStatusContent);

      await expect(parser.parse(filePath)).rejects.toThrow();
    });

    it("should throw error for invalid slug format", async () => {
      const invalidSlugContent = `---
title: "Test Article"
excerpt: "Test excerpt"
date: "2024-01-15"
status: "published"
slug: "Invalid_Slug_With_Underscores"
---

# Content
`;

      const filePath = path.join(testDir, "invalid-slug.mdx");
      await writeFile(filePath, invalidSlugContent);

      await expect(parser.parse(filePath)).rejects.toThrow();
    });

    it("should throw error for invalid MDX syntax", async () => {
      const invalidMdxContent = `---
title: "Test Article"
excerpt: "Test excerpt"
date: "2024-01-15"
status: "published"
slug: "test-article"
---

# Valid Heading

<UnknownComponent invalidProp={unclosedBrace />

Some content
`;

      const filePath = path.join(testDir, "invalid-mdx.mdx");
      await writeFile(filePath, invalidMdxContent);

      await expect(parser.parse(filePath)).rejects.toThrow();
    });
  });

  describe("validateMetadata", () => {
    it("should validate correct metadata", () => {
      const validMetadata = {
        title: "Test Title",
        excerpt: "Test excerpt",
        date: "2024-01-15",
        status: "published",
        slug: "test-slug",
      };

      expect(() => parser.validateMetadata(validMetadata)).not.toThrow();
    });

    it("should throw for empty title", () => {
      const invalidMetadata = {
        title: "",
        excerpt: "Test excerpt",
        date: "2024-01-15",
        status: "published",
        slug: "test-slug",
      };

      expect(() => parser.validateMetadata(invalidMetadata)).toThrow();
    });

    it("should throw for missing excerpt", () => {
      const invalidMetadata = {
        title: "Test Title",
        date: "2024-01-15",
        status: "published",
        slug: "test-slug",
      };

      expect(() => parser.validateMetadata(invalidMetadata)).toThrow();
    });

    it("should require slug field", () => {
      const invalidMetadata = {
        title: "Test Title",
        excerpt: "Test excerpt",
        date: "2024-01-15",
        status: "draft",
      };

      expect(() => parser.validateMetadata(invalidMetadata)).toThrow();
    });
  });

  describe("validateMDX", () => {
    it("should validate correct MDX content", async () => {
      const validMdx = `# Heading

This is a paragraph with **bold** text.

## Subheading

- List item 1
- List item 2
`;

      const result = await parser.validateMDX(validMdx);
      expect(result).toBe(true);
    });

    it("should validate MDX with JSX components", async () => {
      const validMdxWithJsx = `# Heading

<div className="custom-class">
  This is JSX content
</div>

Regular markdown content.
`;

      const result = await parser.validateMDX(validMdxWithJsx);
      expect(result).toBe(true);
    });

    it("should throw for invalid MDX syntax", async () => {
      const invalidMdx = `# Heading

<div unclosedTag
  Missing closing bracket

Some content
`;

      await expect(parser.validateMDX(invalidMdx)).rejects.toThrow();
    });

    it("should handle empty content", async () => {
      const emptyContent = "";

      const result = await parser.validateMDX(emptyContent);
      expect(result).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle complex front matter", async () => {
      const complexContent = `---
title: "Article with Complex Front Matter"
excerpt: "This article has complex metadata"
date: "2024-01-15"
status: "published"
slug: "complex-article"
tags:
  - javascript
  - nodejs
author:
  name: "John Doe"
  email: "john@example.com"
---

# Complex Article

Content here.
`;

      const filePath = path.join(testDir, "complex.mdx");
      await writeFile(filePath, complexContent);

      const result = await parser.parse(filePath);

      expect(result.metadata.title).toBe("Article with Complex Front Matter");
      expect(result.metadata.slug).toBe("complex-article");
    });

    it("should handle MDX with imports and exports", async () => {
      const mdxWithImports = `---
title: "MDX with Imports"
excerpt: "Testing MDX with imports"
date: "2024-01-15"
status: "draft"
slug: "mdx-with-imports"
---

import { Component } from './component'

export const data = { key: 'value' }

# Article with Imports

<Component />

Content here.
`;

      const filePath = path.join(testDir, "with-imports.mdx");
      await writeFile(filePath, mdxWithImports);

      const result = await parser.parse(filePath);

      expect(result.metadata.title).toBe("MDX with Imports");
      expect(result.content).toContain("import");
      expect(result.content).toContain("export");
    });
  });
});
