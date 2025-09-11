import { ErrorCode } from "@repo/types/errors";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode, StatusCode } from "hono/utils/http-status";
import { HonoContext } from "./types/context";
import { createErrorResponse } from "@/lib/utils";
import { ErrorResponse } from "@repo/types/api";
import z, { ZodError } from "zod";

interface ErrorDetail {
  readonly message: string;
  readonly status: ContentfulStatusCode;
}

const errors: Record<ErrorCode, ErrorDetail> = {
  [ErrorCode.UNKNOWN]: { message: "Unknown error occurred", status: 500 },
  [ErrorCode.INVALID_INPUT]: { message: "Invalid input provided", status: 400 },
  [ErrorCode.INVALID_API_KEY]: {
    message: "Invalid or missing API key",
    status: 401,
  },
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: {
    message: "Insufficient permissions to perform this action",
    status: 403,
  },
  [ErrorCode.RESOURCE_NOT_FOUND]: {
    message: "Requested resource not found",
    status: 404,
  },
  [ErrorCode.VALIDATION]: { message: "Validation failed", status: 400 },
  [ErrorCode.DUPLICATE_SLUG]: {
    message: "A resource with this slug already exists",
    status: 409,
  },
  [ErrorCode.DATABASE]: { message: "Database operation failed", status: 500 },
  [ErrorCode.INTERNAL]: { message: "Internal server error", status: 500 },
  // CMS-specific error mappings
  [ErrorCode.ARTICLE_NOT_FOUND]: {
    message: "Article not found",
    status: 404,
  },
  [ErrorCode.ARTICLE_EXISTS]: {
    message: "An article with this slug already exists",
    status: 409,
  },
  [ErrorCode.SITE_NOT_FOUND]: {
    message: "Site not found",
    status: 404,
  },
  // Image upload error mappings
  [ErrorCode.INVALID_ADMIN_KEY]: {
    message: "Invalid or missing admin API key",
    status: 401,
  },
  [ErrorCode.INVALID_FILE_TYPE]: {
    message: "Unsupported file type. Allowed types: jpg, jpeg, png, gif, webp",
    status: 400,
  },
  [ErrorCode.FILE_TOO_LARGE]: {
    message: "File size exceeds 5MB limit",
    status: 413,
  },
  [ErrorCode.UPLOAD_FAILED]: {
    message: "Failed to upload file to storage",
    status: 500,
  },
  [ErrorCode.MISSING_FILE]: {
    message: "No file provided in the request",
    status: 400,
  },
};

export class CustomHttpException extends HTTPException {
  public code: ErrorCode;

  constructor(
    code: ErrorCode,
    options?: { cause?: unknown; message?: string },
  ) {
    const message = options?.message ?? errors[code].message;
    super(errors[code].status, { message, cause: options?.cause });
    this.code = code;
  }
}

export function errorHandler(e: Error, c: HonoContext) {
  let status: StatusCode = 500;
  let response: ErrorResponse;

  console.error("[OnError]:", e);

  if (e instanceof CustomHttpException) {
    status = e.status;
    response = createErrorResponse(e.code, e.message);
  } else if (e instanceof HTTPException) {
    status = e.status;
    response = createErrorResponse(ErrorCode.INTERNAL, e.message);
  } else if (e instanceof ZodError) {
    status = errors[ErrorCode.INVALID_INPUT].status;
    const message = z.prettifyError(e);
    response = createErrorResponse(ErrorCode.INVALID_INPUT, message);
  } else {
    // Handle database constraint errors
    if (e.message.includes("UNIQUE constraint failed")) {
      if (e.message.includes("slug")) {
        status = errors[ErrorCode.DUPLICATE_SLUG].status;
        response = createErrorResponse(
          ErrorCode.DUPLICATE_SLUG,
          errors[ErrorCode.DUPLICATE_SLUG].message,
        );
      } else if (e.message.includes("key")) {
        status = errors[ErrorCode.VALIDATION].status;
        response = createErrorResponse(
          ErrorCode.VALIDATION,
          "API key already exists",
        );
      } else if (e.message.includes("name")) {
        status = errors[ErrorCode.VALIDATION].status;
        response = createErrorResponse(
          ErrorCode.VALIDATION,
          "A resource with this name already exists",
        );
      } else {
        status = errors[ErrorCode.VALIDATION].status;
        response = createErrorResponse(
          ErrorCode.VALIDATION,
          "Resource already exists",
        );
      }
    } else if (e.message.includes("FOREIGN KEY constraint failed")) {
      status = errors[ErrorCode.VALIDATION].status;
      response = createErrorResponse(
        ErrorCode.VALIDATION,
        "Referenced resource does not exist",
      );
    } else if (e.message.includes("database") || e.message.includes("D1")) {
      status = errors[ErrorCode.DATABASE].status;
      response = createErrorResponse(
        ErrorCode.DATABASE,
        errors[ErrorCode.DATABASE].message,
      );
    } else {
      status = 500;
      // 使用预定义的通用错误，绝对不泄露 err.message
      response = createErrorResponse(
        ErrorCode.UNKNOWN,
        errors[ErrorCode.UNKNOWN].message,
      );
    }
  }
  c.status(status);
  return c.json(response);
}
