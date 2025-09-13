import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { ErrorCode } from "@repo/types/error";
import { CustomHttpException } from "@/error";
import { createDb } from "@/db";
import { sites, apiKeys } from "@/db/schema/cms";
import { createSuccessResponse } from "@/lib/utils";
import { generateApiKey, hashApiKey } from "@/lib/crypto";
import { adminAuth } from "@/middleware/admin-auth";
import { CFBindings, MiddlewareVars } from "@/types/context";
import { createApiKeySchema, siteIdParamSchema } from "@/types/validation";

const router = new Hono<{ Bindings: CFBindings; Variables: MiddlewareVars }>();

// Apply admin authentication middleware to all routes
router.use("*", adminAuth());

// POST /sites/{siteId}/api-keys - Create new API key for a site
router.post(
  "/sites/:siteId/api-keys",
  zValidator("param", siteIdParamSchema),
  zValidator("json", createApiKeySchema),
  async (c) => {
    const { siteId } = c.req.valid("param");
    const { name, expiresAt } = c.req.valid("json");
    const db = createDb(c.env.DB);

    // Check if site exists
    const site = await db
      .select({ id: sites.id })
      .from(sites)
      .where(eq(sites.id, siteId))
      .get();

    if (!site) {
      throw new CustomHttpException(ErrorCode.SITE_NOT_FOUND, {
        message: "Site not found",
      });
    }

    // Generate new API key and hash it
    const apiKey = generateApiKey();
    const keyHash = await hashApiKey(apiKey);

    // Create API key record
    const apiKeyId = crypto.randomUUID();
    const now = new Date();
    const expirationDate = expiresAt ? new Date(expiresAt) : null;

    await db.insert(apiKeys).values({
      id: apiKeyId,
      siteId,
      keyHash,
      name,
      expiresAt: expirationDate,
      createdAt: now,
      updatedAt: now,
    });

    const response = {
      id: apiKeyId,
      apiKey, // Return the actual API key (only shown once)
      name,
      siteId,
      expiresAt: expirationDate?.toISOString() ?? null,
      createdAt: now.toISOString(),
    };

    return c.json(createSuccessResponse(response), 201);
  },
);

export default router;
