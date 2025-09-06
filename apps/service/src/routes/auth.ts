import { createAuth } from "@/lib/auth";
import { CFBindings, MiddlewareVars } from "@/types/context";
import { Hono } from "hono";

const router = new Hono<{ Bindings: CFBindings; Variables: MiddlewareVars }>();

router.on(["POST", "GET"], "/auth/*", (c) => {
  return createAuth(c.env).handler(c.req.raw);
});

export default router;
