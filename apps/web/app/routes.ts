import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export enum AppRoutes {
  Root = "/",

  // marketing
  Features = "/#features",
  Pricing = "/#pricing",
  FAQ = "/#faq",
  Blog = "/blog",
  Docs = "/docs",
  Changelog = "/changelog",

  // legal
  CookiePolicy = "/cookie",
  PrivacyPolicy = "/privacy",
  TermsOfService = "/terms",
}

export default [
  ...prefix("/:locale?", [
    layout("./routes/layout.tsx", [
      // marketing
      index("./routes/marketing/home.tsx"),

      // legal
      route("/terms", "./routes/legal/terms.tsx"),
      route("/privacy", "./routes/legal/privacy.tsx"),
      route("/cookie", "./routes/legal/cookie.tsx"),
    ]),

    route("/action/set-theme", "./routes/action/set-theme.tsx"),
  ]),
] satisfies RouteConfig;
