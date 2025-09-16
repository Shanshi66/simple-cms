import { MiddlewareHandler } from "hono";
import { eq } from "drizzle-orm";
import { ErrorCode } from "@repo/types/error";
import { CustomHttpException } from "@/error";
import { createDb } from "@/db";
import { apiKeys, sites } from "@/db/schema/cms";
import { hashApiKey, isApiKeyExpired } from "@/lib/crypto";
import { CFBindings, MiddlewareVars } from "@/types/context";

/**
 * Middleware to authenticate API keys via Bearer token and populate site name in context
 * Extracts and validates the API key from Authorization header, then sets siteName in context
 */
export function apiAuth(): MiddlewareHandler<{
  Bindings: CFBindings;
  Variables: MiddlewareVars;
}> {
  return async (c, next) => {
    // Extract Authorization header
    const authHeader = c.req.header("Authorization");

    if (!authHeader) {
      throw new CustomHttpException(ErrorCode.INVALID_API_KEY, {
        message: "Missing Authorization header",
      });
    }

    // Check for Bearer token format
    const bearerRegex = /^Bearer\s+(.+)$/;
    const match = bearerRegex.exec(authHeader);
    if (!match) {
      throw new CustomHttpException(ErrorCode.INVALID_API_KEY, {
        message:
          "Invalid Authorization header format. Expected: Bearer <token>",
      });
    }

    const apiKeyValue = match[1];
    if (!apiKeyValue) {
      throw new CustomHttpException(ErrorCode.INVALID_API_KEY, {
        message: "Missing API key in Authorization header",
      });
    }

    // Create database connection
    const db = createDb(c.env.DB);

    // Hash the provided API key to search in database
    const apiKeyHash = await hashApiKey(apiKeyValue);

    // Find API key record by hash (more efficient than querying all)
    const matchedApiKey = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyHash, apiKeyHash))
      .get();

    if (!matchedApiKey) {
      throw new CustomHttpException(ErrorCode.INVALID_API_KEY, {
        message: "Invalid API key",
      });
    }

    // Check if API key is expired
    if (isApiKeyExpired(matchedApiKey.expiresAt)) {
      throw new CustomHttpException(ErrorCode.INVALID_API_KEY, {
        message: "API key has expired",
      });
    }

    // Query site name using the site ID from the API key
    const site = await db
      .select({ name: sites.name })
      .from(sites)
      .where(eq(sites.id, matchedApiKey.siteId))
      .get();

    if (!site) {
      throw new CustomHttpException(ErrorCode.INVALID_API_KEY, {
        message: "Site not found for the provided API key",
      });
    }

    // Store the site name in context for route handlers
    c.set("siteName", site.name);

    await next();
  };
}
