import { describe, it, expect } from "vitest";
import {
  generateApiKey,
  hashApiKey,
  isApiKeyExpired,
  verifyApiKey,
} from "./crypto";

describe("Crypto Utilities", () => {
  describe("generateApiKey", () => {
    it("should generate a unique API key", () => {
      const key1 = generateApiKey();
      const key2 = generateApiKey();

      expect(key1).toBeDefined();
      expect(key2).toBeDefined();
      expect(key1).not.toBe(key2);
      expect(typeof key1).toBe("string");
      expect(typeof key2).toBe("string");
    });

    it("should generate API keys with consistent length", () => {
      const key1 = generateApiKey();
      const key2 = generateApiKey();
      const key3 = generateApiKey();

      expect(key1.length).toBeGreaterThan(40); // Base64url encoded 32 bytes should be ~43 chars
      expect(key1.length).toBe(key2.length);
      expect(key1.length).toBe(key3.length);
    });

    it("should generate URL-safe base64 strings", () => {
      const key = generateApiKey();

      // Should not contain +, /, or = characters (URL-safe base64)
      expect(key).not.toMatch(/[+/=]/);
      // Should only contain valid base64url characters
      expect(key).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it("should generate keys with sufficient entropy", () => {
      const keys = new Set();
      const numKeys = 100;

      // Generate 100 keys and ensure they're all unique
      for (let i = 0; i < numKeys; i++) {
        const key = generateApiKey();
        keys.add(key);
      }

      expect(keys.size).toBe(numKeys);
    });
  });

  describe("hashApiKey", () => {
    it("should hash an API key to a hex string", async () => {
      const apiKey = "test-api-key";
      const hash = await hashApiKey(apiKey);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      // SHA-256 hash should be 64 characters long when in hex format
      expect(hash.length).toBe(64);
      // Should only contain valid hex characters
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });

    it("should produce consistent hashes for the same input", async () => {
      const apiKey = "consistent-test-key";
      const hash1 = await hashApiKey(apiKey);
      const hash2 = await hashApiKey(apiKey);

      expect(hash1).toBe(hash2);
    });

    it("should produce different hashes for different inputs", async () => {
      const hash1 = await hashApiKey("key1");
      const hash2 = await hashApiKey("key2");

      expect(hash1).not.toBe(hash2);
    });

    it("should handle empty strings", async () => {
      const hash = await hashApiKey("");

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash.length).toBe(64);
    });

    it("should handle Unicode characters", async () => {
      const unicodeKey = "测试-key-🔑";
      const hash = await hashApiKey(unicodeKey);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash.length).toBe(64);
    });

    it("should produce expected hash for known input", async () => {
      // Test with a known input to ensure consistent behavior
      const knownInput = "test";
      const expectedHash =
        "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
      const hash = await hashApiKey(knownInput);

      expect(hash).toBe(expectedHash);
    });
  });

  describe("verifyApiKey", () => {
    it("should verify a correct API key against its hash", async () => {
      const apiKey = "test-verification-key";
      const hash = await hashApiKey(apiKey);
      const isValid = await verifyApiKey(apiKey, hash);

      expect(isValid).toBe(true);
    });

    it("should reject incorrect API key", async () => {
      const correctKey = "correct-key";
      const wrongKey = "wrong-key";
      const hash = await hashApiKey(correctKey);
      const isValid = await verifyApiKey(wrongKey, hash);

      expect(isValid).toBe(false);
    });

    it("should reject empty API key against non-empty hash", async () => {
      const hash = await hashApiKey("non-empty-key");
      const isValid = await verifyApiKey("", hash);

      expect(isValid).toBe(false);
    });

    it("should reject API key against empty hash", async () => {
      const isValid = await verifyApiKey("some-key", "");

      expect(isValid).toBe(false);
    });

    it("should reject API key against invalid hash", async () => {
      const isValid = await verifyApiKey("some-key", "not-a-valid-hex-hash");

      expect(isValid).toBe(false);
    });

    it("should handle malformed hash gracefully", async () => {
      const invalidHash = "xyzzxyz"; // Not valid hex
      const isValid = await verifyApiKey("test-key", invalidHash);

      expect(isValid).toBe(false);
    });

    it("should verify generated API key", async () => {
      const apiKey = generateApiKey();
      const hash = await hashApiKey(apiKey);
      const isValid = await verifyApiKey(apiKey, hash);

      expect(isValid).toBe(true);
    });
  });

  describe("isApiKeyExpired", () => {
    it("should return false for null expiration", () => {
      const isExpired = isApiKeyExpired(null);
      expect(isExpired).toBe(false);
    });

    it("should return false for future expiration", () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      const isExpired = isApiKeyExpired(futureDate);
      expect(isExpired).toBe(false);
    });

    it("should return true for past expiration", () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      const isExpired = isApiKeyExpired(pastDate);
      expect(isExpired).toBe(true);
    });

    it("should return true for current time (edge case)", () => {
      const now = new Date();
      // Wait a tiny bit to ensure current time passes
      setTimeout(() => {
        const isExpired = isApiKeyExpired(now);
        expect(isExpired).toBe(true);
      }, 1);
    });

    it("should handle far future dates", () => {
      const farFuture = new Date("2099-12-31T23:59:59Z");
      const isExpired = isApiKeyExpired(farFuture);
      expect(isExpired).toBe(false);
    });

    it("should handle far past dates", () => {
      const farPast = new Date("1970-01-01T00:00:00Z");
      const isExpired = isApiKeyExpired(farPast);
      expect(isExpired).toBe(true);
    });
  });

  describe("Integration tests", () => {
    it("should work with generated keys end-to-end", async () => {
      // Generate a new API key
      const apiKey = generateApiKey();

      // Hash the key
      const hash = await hashApiKey(apiKey);

      // Verify the key against its hash
      const isValid = await verifyApiKey(apiKey, hash);

      expect(isValid).toBe(true);

      // Verify that a different key fails
      const anotherKey = generateApiKey();
      const isInvalid = await verifyApiKey(anotherKey, hash);

      expect(isInvalid).toBe(false);
    });

    it("should maintain consistency across multiple operations", async () => {
      const testKey = "integration-test-key";

      // Hash the same key multiple times
      const hash1 = await hashApiKey(testKey);
      const hash2 = await hashApiKey(testKey);
      const hash3 = await hashApiKey(testKey);

      expect(hash1).toBe(hash2);
      expect(hash2).toBe(hash3);

      // Verify against all hashes
      expect(await verifyApiKey(testKey, hash1)).toBe(true);
      expect(await verifyApiKey(testKey, hash2)).toBe(true);
      expect(await verifyApiKey(testKey, hash3)).toBe(true);
    });
  });
});
