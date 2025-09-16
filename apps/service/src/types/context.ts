import { Context } from "hono";

export interface CFBindings {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  BASE_URL: string;
  CLIENT_URL: string;
  NODE_ENV: "development" | "production";
  ADMIN_API_KEY: string;
  R2_PUBLIC_DOMAIN: string;
}

export interface MiddlewareVars {
  siteName: string;
}

export type HonoContext = Context<{
  Bindings: CFBindings;
  Variables: MiddlewareVars;
}>;
