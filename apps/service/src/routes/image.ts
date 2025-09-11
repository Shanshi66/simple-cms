import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ErrorCode } from "@repo/types/errors";
import {
  ImageUploadFormSchema,
  SUPPORTED_IMAGE_TYPES,
  MAX_IMAGE_FILE_SIZE,
  ImageContentType,
} from "@repo/types/image";
import { ImageUploadSuccessData } from "@repo/types/api";
import { CustomHttpException } from "@/error";
import { createSuccessResponse } from "@/lib/utils";
import { adminAuth } from "@/middleware/admin-auth";
import { CFBindings, MiddlewareVars } from "@/types/context";

const router = new Hono<{ Bindings: CFBindings; Variables: MiddlewareVars }>();

// Apply admin authentication middleware to all routes
router.use("*", adminAuth());

// Helper function to get file extension from content type
function getFileExtension(contentType: ImageContentType): string {
  switch (contentType) {
    case "image/jpeg":
    case "image/jpg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/gif":
      return "gif";
    case "image/webp":
      return "webp";
    default:
      throw new CustomHttpException(ErrorCode.INVALID_FILE_TYPE);
  }
}

// Helper function to validate file type
function validateFileType(contentType: string): void {
  if (!SUPPORTED_IMAGE_TYPES.includes(contentType as ImageContentType)) {
    throw new CustomHttpException(ErrorCode.INVALID_FILE_TYPE, {
      message: `Unsupported file type: ${contentType}. Allowed types: jpg, jpeg, png, gif, webp`,
    });
  }
}

// Helper function to validate file size
function validateFileSize(size: number): void {
  if (size > MAX_IMAGE_FILE_SIZE) {
    throw new CustomHttpException(ErrorCode.FILE_TOO_LARGE, {
      message: `File size (${Math.round(size / 1024)}KB) exceeds 5MB limit`,
    });
  }
}

// POST /image/upload - Upload image to R2 storage
router.post(
  "/image/upload",
  zValidator("form", ImageUploadFormSchema),
  async (c): Promise<Response> => {
    const { siteId, postSlug } = c.req.valid("form");

    // Get the uploaded file from form data
    const body = await c.req.parseBody();
    const imageFile = body.image;

    if (!(imageFile instanceof File)) {
      throw new CustomHttpException(ErrorCode.MISSING_FILE, {
        message: "No image file provided in the request",
      });
    }

    // Validate file type
    validateFileType(imageFile.type);

    // Validate file size
    validateFileSize(imageFile.size);

    // Generate unique filename with path structure
    const fileExtension = getFileExtension(imageFile.type as ImageContentType);
    const fileName = `${crypto.randomUUID()}.${fileExtension}`;
    const filePath = `${siteId}/${postSlug}/${fileName}`;

    try {
      // Convert File to ArrayBuffer for R2 upload
      const arrayBuffer = await imageFile.arrayBuffer();

      // Upload to R2
      await c.env.R2_BUCKET.put(filePath, arrayBuffer, {
        httpMetadata: {
          contentType: imageFile.type,
        },
      });

      // Construct public URL
      const imageUrl = `https://${c.env.R2_PUBLIC_DOMAIN}/${filePath}`;

      // Return success response with image details
      const response: ImageUploadSuccessData = {
        url: imageUrl,
      };

      return c.json(createSuccessResponse(response), 201);
    } catch (error) {
      console.error("R2 upload failed:", error);
      throw new CustomHttpException(ErrorCode.UPLOAD_FAILED, {
        message: "Failed to upload image to storage",
      });
    }
  },
);

export default router;
