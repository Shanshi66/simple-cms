import { z } from "zod";

// Supported image file types
export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

// Maximum file size (5MB in bytes)
export const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;

// Zod schema for image upload form validation
export const ImageUploadFormSchema = z.object({
  siteId: z.string().min(1, "Site ID is required"),
  postSlug: z.string().min(1, "Post slug is required"),
});

// Types inferred from schemas
export type ImageUploadForm = z.infer<typeof ImageUploadFormSchema>;

// File extension mapping type
export type ImageContentType = (typeof SUPPORTED_IMAGE_TYPES)[number];
