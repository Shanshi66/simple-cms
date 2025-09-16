import { z } from "zod";

// Validation constants
export const SITE_NAME_REGEX = /^[a-zA-Z0-9-]+$/;
export const ISO_DATETIME_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

// Zod schemas for site management
export const CreateSiteRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Site name is required")
    .regex(
      SITE_NAME_REGEX,
      "Site name must contain only letters, numbers, and hyphens",
    ),
  description: z.string().optional(),
});

export const CreateSiteResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Zod schemas for API key management
export const CreateApiKeyRequestSchema = z.object({
  name: z.string().min(1, "API Key name is required"),
  expiresAt: z
    .string()
    .regex(ISO_DATETIME_REGEX, "expiresAt must be a valid ISO 8601 datetime")
    .optional(),
});

export const CreateApiKeyResponseSchema = z.object({
  id: z.string(),
  apiKey: z.string(),
  name: z.string(),
  siteId: z.string(),
  expiresAt: z.string().nullable(),
  createdAt: z.string(),
});

// Types inferred from schemas
export type CreateSiteRequest = z.infer<typeof CreateSiteRequestSchema>;
export type CreateSiteResponse = z.infer<typeof CreateSiteResponseSchema>;
export type CreateApiKeyRequest = z.infer<typeof CreateApiKeyRequestSchema>;
export type CreateApiKeyResponse = z.infer<typeof CreateApiKeyResponseSchema>;
