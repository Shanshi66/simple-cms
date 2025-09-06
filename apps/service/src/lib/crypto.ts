/**
 * Crypto utility functions for API key management
 * Uses Web Crypto API available in Cloudflare Workers
 */

/**
 * Generate a new API key
 * @returns A secure random API key string
 */
export function generateApiKey(): string {
  // Generate 32 bytes of random data
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);

  // Convert to base64url (URL-safe base64)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Hash an API key using SHA-256
 * @param apiKey The API key to hash
 * @returns The SHA-256 hash as a hex string
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);

  // Convert to hex string
  return Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Verify an API key against its hash
 * @param apiKey The API key to verify
 * @param hash The stored hash to verify against
 * @returns True if the API key matches the hash
 */
export async function verifyApiKey(
  apiKey: string,
  hash: string,
): Promise<boolean> {
  try {
    const computedHash = await hashApiKey(apiKey);
    return computedHash === hash;
  } catch {
    // If hashing fails, verification fails
    return false;
  }
}

/**
 * Check if an API key is expired
 * @param expiresAt The expiration timestamp (nullable)
 * @returns True if the key is expired or invalid
 */
export function isApiKeyExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) {
    // No expiration set, key is valid
    return false;
  }

  return new Date() > expiresAt;
}
