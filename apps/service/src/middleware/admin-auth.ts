import { MiddlewareHandler } from "hono";
import { ErrorCode } from "@repo/types/error";
import { CustomHttpException } from "@/error";
import { CFBindings, MiddlewareVars } from "@/types/context";

/**
 * Middleware to authenticate admin API key via Bearer token
 * Validates the API key from Authorization header against ADMIN_API_KEY environment variable
 */
export function adminAuth(): MiddlewareHandler<{
  Bindings: CFBindings;
  Variables: MiddlewareVars;
}> {
  return async (c, next) => {
    // Extract Authorization header
    const authHeader = c.req.header("Authorization");
    const adminKey = c.env.ADMIN_API_KEY;

    if (!authHeader) {
      throw new CustomHttpException(ErrorCode.INVALID_ADMIN_KEY, {
        message: "Missing Authorization header",
      });
    }

    if (!adminKey) {
      throw new CustomHttpException(ErrorCode.INVALID_ADMIN_KEY, {
        message: "Admin API key not configured",
      });
    }

    // Check for Bearer token format
    const bearerRegex = /^Bearer\s+(.+)$/;
    const match = bearerRegex.exec(authHeader);
    if (!match) {
      throw new CustomHttpException(ErrorCode.INVALID_ADMIN_KEY, {
        message:
          "Invalid Authorization header format. Expected: Bearer <token>",
      });
    }

    const token = match[1];
    if (!token) {
      throw new CustomHttpException(ErrorCode.INVALID_ADMIN_KEY, {
        message: "Missing admin API key in Authorization header",
      });
    }

    // Validate token against admin key
    if (token !== adminKey) {
      throw new CustomHttpException(ErrorCode.INVALID_ADMIN_KEY, {
        message: "Invalid admin API key",
      });
    }

    await next();
  };
}
