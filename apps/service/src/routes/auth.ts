import { createAuth } from "@/lib/auth";
import { CFBindings } from "@/types/bindings";
import { Hono } from "hono";

const router = new Hono<{ Bindings: CFBindings }>();

router.on(["POST", "GET"], "/auth/*", (c) => {
  return createAuth(c.env).handler(c.req.raw);
});

export default router;
