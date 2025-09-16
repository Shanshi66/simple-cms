import { describe, it, expect, beforeEach } from "vitest";
import app from "./image";
import { errorHandler } from "@/error";
import { ErrorCode } from "@repo/types/error";
import { env } from "cloudflare:test";

describe("Image Upload Routes", () => {
  beforeEach(() => {
    app.onError(errorHandler);
  });

  // Helper function to create a test image file
  function createTestImageFile(
    name = "test.jpg",
    type = "image/jpeg",
    size = 1024,
  ): File {
    const content = new Uint8Array(size);
    return new File([content], name, { type });
  }

  // Helper function to create form data
  function createFormData(
    imageFile: File,
    siteName = "test-site",
    postSlug = "test-post",
  ): FormData {
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("siteName", siteName);
    formData.append("postSlug", postSlug);
    return formData;
  }

  describe("POST /image/upload - Successful uploads", () => {
    it("should upload JPEG image successfully", async () => {
      const imageFile = createTestImageFile("test.jpg", "image/jpeg", 1024);
      const formData = createFormData(imageFile);

      const res = await app.request(
        "/image/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: formData,
        },
        env,
      );

      expect(res.status).toBe(201);
      const responseBody = await res.json();

      expect(responseBody).toHaveProperty("success", true);
      expect(responseBody).toHaveProperty("data");
      expect(responseBody).toHaveProperty("data.url");

      // Verify response structure without accessing properties directly
      expect(JSON.stringify(responseBody)).toContain(
        `https://${env.R2_PUBLIC_DOMAIN}/test-site/test-post/`,
      );
      expect(JSON.stringify(responseBody)).toMatch(/\.jpg/);

      // Image upload succeeded - R2 integration works with real environment
    });

    it("should upload PNG image successfully", async () => {
      const imageFile = createTestImageFile("test.png", "image/png", 2048);
      const formData = createFormData(imageFile);

      const res = await app.request(
        "/image/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: formData,
        },
        env,
      );

      expect(res.status).toBe(201);
      const responseBody = await res.json();

      expect(JSON.stringify(responseBody)).toMatch(/\.png/);
    });

    it("should upload GIF image successfully", async () => {
      const imageFile = createTestImageFile("test.gif", "image/gif", 512);
      const formData = createFormData(imageFile);

      const res = await app.request(
        "/image/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: formData,
        },
        env,
      );

      expect(res.status).toBe(201);
      const responseBody = await res.json();

      expect(JSON.stringify(responseBody)).toMatch(/\.gif/);
    });

    it("should upload WebP image successfully", async () => {
      const imageFile = createTestImageFile("test.webp", "image/webp", 1536);
      const formData = createFormData(imageFile);

      const res = await app.request(
        "/image/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: formData,
        },
        env,
      );

      expect(res.status).toBe(201);
      const responseBody = await res.json();

      expect(JSON.stringify(responseBody)).toMatch(/\.webp/);
    });

    it("should handle JPG content type correctly", async () => {
      const imageFile = createTestImageFile("test.jpg", "image/jpg", 1024);
      const formData = createFormData(imageFile);

      const res = await app.request(
        "/image/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: formData,
        },
        env,
      );

      expect(res.status).toBe(201);
      const responseBody = await res.json();

      expect(JSON.stringify(responseBody)).toMatch(/\.jpg/); // Should still use .jpg extension
    });
  });

  describe("Authentication", () => {
    it("should require admin authentication", async () => {
      const imageFile = createTestImageFile();
      const formData = createFormData(imageFile);

      const res = await app.request(
        "/image/upload",
        {
          method: "POST",
          body: formData,
        },
        env,
      );

      expect(res.status).toBe(401);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty(
        "error.code",
        ErrorCode.INVALID_ADMIN_KEY,
      );
    });

    it("should reject invalid admin key", async () => {
      const imageFile = createTestImageFile();
      const formData = createFormData(imageFile);

      const res = await app.request(
        "/image/upload",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer wrong-key",
          },
          body: formData,
        },
        env,
      );

      expect(res.status).toBe(401);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty(
        "error.code",
        ErrorCode.INVALID_ADMIN_KEY,
      );
    });
  });

  describe("File validation", () => {
    it("should reject missing image file", async () => {
      const formData = new FormData();
      formData.append("siteName", "test-site");
      formData.append("postSlug", "test-post");

      const res = await app.request(
        "/image/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: formData,
        },
        env,
      );

      expect(res.status).toBe(400);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty("error.code", ErrorCode.MISSING_FILE);
    });

    it("should reject unsupported file type", async () => {
      const imageFile = createTestImageFile("test.txt", "text/plain", 1024);
      const formData = createFormData(imageFile);

      const res = await app.request(
        "/image/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: formData,
        },
        env,
      );

      expect(res.status).toBe(400);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty(
        "error.code",
        ErrorCode.INVALID_FILE_TYPE,
      );
      expect(JSON.stringify(responseBody)).toContain("text/plain");
    });

    it("should reject file that is too large", async () => {
      const largeSize = 6 * 1024 * 1024; // 6MB
      const imageFile = createTestImageFile(
        "large.jpg",
        "image/jpeg",
        largeSize,
      );
      const formData = createFormData(imageFile);

      const res = await app.request(
        "/image/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: formData,
        },
        env,
      );

      expect(res.status).toBe(413);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty(
        "error.code",
        ErrorCode.FILE_TOO_LARGE,
      );
      expect(JSON.stringify(responseBody)).toContain("6144KB");
    });

    it("should accept file at maximum size limit", async () => {
      const maxSize = 5 * 1024 * 1024; // Exactly 5MB
      const imageFile = createTestImageFile("max.jpg", "image/jpeg", maxSize);
      const formData = createFormData(imageFile);

      const res = await app.request(
        "/image/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: formData,
        },
        env,
      );

      expect(res.status).toBe(201);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", true);
    });
  });

  describe("Form validation", () => {
    it("should require siteName field", async () => {
      const imageFile = createTestImageFile();
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("postSlug", "test-post");

      const res = await app.request(
        "/image/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: formData,
        },
        env,
      );

      expect(res.status).toBe(400);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty("error");
    });

    it("should require postSlug field", async () => {
      const imageFile = createTestImageFile();
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("siteName", "test-site");

      const res = await app.request(
        "/image/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: formData,
        },
        env,
      );

      expect(res.status).toBe(400);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty("error");
    });

    it("should reject empty siteName", async () => {
      const imageFile = createTestImageFile();
      const formData = createFormData(imageFile, "", "test-post");

      const res = await app.request(
        "/image/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: formData,
        },
        env,
      );

      expect(res.status).toBe(400);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty("error");
    });

    it("should reject empty postSlug", async () => {
      const imageFile = createTestImageFile();
      const formData = createFormData(imageFile, "test-site", "");

      const res = await app.request(
        "/image/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: formData,
        },
        env,
      );

      expect(res.status).toBe(400);
      const responseBody = await res.json();
      expect(responseBody).toHaveProperty("success", false);
      expect(responseBody).toHaveProperty("error");
    });
  });

  describe("Path generation", () => {
    it("should generate unique paths for multiple uploads", async () => {
      const imageFile1 = createTestImageFile("test1.jpg");
      const imageFile2 = createTestImageFile("test2.jpg");
      const formData1 = createFormData(imageFile1, "site1", "post1");
      const formData2 = createFormData(imageFile2, "site1", "post1");

      const res1 = await app.request(
        "/image/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: formData1,
        },
        env,
      );

      const res2 = await app.request(
        "/image/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.ADMIN_API_KEY}`,
          },
          body: formData2,
        },
        env,
      );

      expect(res1.status).toBe(201);
      expect(res2.status).toBe(201);

      const body1 = await res1.json();
      const body2 = await res2.json();

      // Verify both responses have url property and they contain expected pattern
      expect(body1).toHaveProperty("data.url");
      expect(body2).toHaveProperty("data.url");
      expect(JSON.stringify(body1)).toMatch(/site1\/post1\/[a-f0-9-]{36}\.jpg/);
      expect(JSON.stringify(body2)).toMatch(/site1\/post1\/[a-f0-9-]{36}\.jpg/);

      // Verify responses are different (different UUIDs)
      expect(JSON.stringify(body1)).not.toBe(JSON.stringify(body2));
    });

    it("should respect different siteName and postSlug combinations", async () => {
      const imageFile = createTestImageFile();

      const tests = [
        { siteName: "blog", postSlug: "hello-world" },
        { siteName: "docs", postSlug: "getting-started" },
        { siteName: "portfolio", postSlug: "project-showcase" },
      ];

      for (const { siteName, postSlug } of tests) {
        const formData = createFormData(imageFile, siteName, postSlug);

        const res = await app.request(
          "/image/upload",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${env.ADMIN_API_KEY}`,
            },
            body: formData,
          },
          env,
        );

        expect(res.status).toBe(201);
        const responseBody = await res.json();

        expect(responseBody).toHaveProperty("data.url");
        expect(JSON.stringify(responseBody)).toMatch(
          new RegExp(`${siteName}\\/${postSlug}\\/[a-f0-9-]{36}\\.jpg`),
        );
        expect(JSON.stringify(responseBody)).toContain(
          `${siteName}/${postSlug}/`,
        );
      }
    });
  });
});
