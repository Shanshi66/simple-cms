import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { ErrorCode } from "@repo/types/error";
import { CustomHttpException } from "@/error";
import { createDb } from "@/db";
import { sites } from "@/db/schema/cms";
import { createSuccessResponse } from "@/lib/utils";
import { adminAuth } from "@/middleware/admin-auth";
import { CFBindings, MiddlewareVars } from "@/types/context";
import { createSiteSchema } from "@/types/validation";
import { SiteListResponse, CreateSiteResponse } from "@/types/api";

const router = new Hono<{ Bindings: CFBindings; Variables: MiddlewareVars }>();

// POST /sites - Create new site
router.post(
  "/sites",
  adminAuth(),
  zValidator("json", createSiteSchema),
  async (c) => {
    const { name, description } = c.req.valid("json");
    const db = createDb(c.env.DB);

    // Check if site with same name already exists
    const existingSite = await db
      .select({ name: sites.name })
      .from(sites)
      .where(eq(sites.name, name))
      .get();

    if (existingSite) {
      throw new CustomHttpException(ErrorCode.SITE_EXISTS, {
        message: "A site with this name already exists",
      });
    }

    // Generate unique site ID and create new site
    const id = crypto.randomUUID();
    const now = new Date();
    await db.insert(sites).values({
      id,
      name,
      description: description ?? null,
      createdAt: now,
      updatedAt: now,
    });

    const response: CreateSiteResponse = {
      id,
      name,
      description: description ?? null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    return c.json(createSuccessResponse(response), 201);
  },
);

// GET /sites - Get all sites
router.get("/sites", adminAuth(), async (c) => {
  const db = createDb(c.env.DB);

  // Get all sites
  const allSites = await db
    .select({
      id: sites.id,
      name: sites.name,
      description: sites.description,
      created_at: sites.createdAt,
      updated_at: sites.updatedAt,
    })
    .from(sites);

  const response: SiteListResponse = {
    sites: allSites.map((site) => ({
      id: site.id,
      name: site.name,
      description: site.description,
      created_at: new Date(site.created_at).toISOString(),
      updated_at: new Date(site.updated_at).toISOString(),
    })),
  };

  return c.json(createSuccessResponse(response));
});

export default router;
