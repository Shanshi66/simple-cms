import { Context } from "hono";

export interface CFBindings {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BASE_URL: string;
  CLIENT_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  NODE_ENV: "development" | "production";
}

export interface MiddlewareVars {
  siteId: string;
}

export type HonoContext = Context<{
  Bindings: CFBindings;
  Variables: MiddlewareVars;
}>;
