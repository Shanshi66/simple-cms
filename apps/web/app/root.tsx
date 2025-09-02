import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "react-router";
import type { Route } from "./+types/root";
import "@repo/ui/style.css";
import { useTranslation } from "react-i18next";
import { DEFAULT_LOCALE, isValidLocale } from "./i18n";
import { useEffect } from "react";
import { ThemeProvider } from "@repo/ui/provider/theme";
import { getThemeFromSession } from "./lib/theme.server";
import clsx from "clsx";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = params.locale;
  if (locale) {
    if (!isValidLocale(locale)) {
      return new Response("Not Found", { status: 404 });
    }
    if (locale === "zn") {
      const url = new URL(request.url);
      const newPathname = "/" + url.pathname.split("/").slice(2).join("/");
      const newPath = `${newPathname}${url.search}${url.hash}`;
      return redirect(newPath);
    }
  }

  const theme = await getThemeFromSession(request);

  return {
    locale,
    theme,
  };
}

interface RootLoaderData {
  locale: string;
  theme: string;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const data = (useRouteLoaderData("root") ?? {}) as RootLoaderData;
  const theme = data ? clsx(data.theme) : undefined;
  return (
    <html lang={i18n.language} dir={i18n.dir()} className={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  const { locale, theme } = loaderData;
  const { i18n } = useTranslation();
  useEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale ?? DEFAULT_LOCALE).catch((e) => {
        console.error(e);
      });
    }
  }, [locale, i18n]);
  return (
    <ThemeProvider defaultTheme={theme}>
      <Outlet />
    </ThemeProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
