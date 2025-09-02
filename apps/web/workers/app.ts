import { getLocale, Locale } from "@/i18n";
import { createRequestHandler } from "react-router";

interface ExportedHandler<Env> {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>;
}

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
    locale: Locale;
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const localeFromPath = pathSegments.at(1);
    const locale = getLocale(localeFromPath);

    return requestHandler(request, {
      cloudflare: { env, ctx },
      locale,
    });
  },
} satisfies ExportedHandler<Env>;
