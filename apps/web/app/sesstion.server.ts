import { createCookieSessionStorage } from "react-router";

interface SessionData {
  theme: string;
}

interface SessionFlashData {
  error: string;
}

console.log(
  "SESSION_SECRET:",
  process.env.SESSION_SECRET,
  import.meta.env.VITE_BASE_URL,
  import.meta.env.VITE_SERVER_URL,
  import.meta.env.PROD,
);

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    // a Cookie from `createCookie` or the CookieOptions to create one
    cookie: {
      name: "__app_session",
      // Expires can also be set (although maxAge overrides it when used in combination).
      // Note that this method is NOT recommended as `new Date` creates only one date on each server deployment, not a dynamic date in the future!
      //
      // expires: new Date(Date.now() + 60_000),
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
      secrets: ["sdfwesdfwe"],
      ...(import.meta.env.PROD
        ? {
            secrets: [import.meta.env.SESSION_SECRET],
            domain: import.meta.env.VITE_BASE_URL,
            secure: true,
          }
        : {}),
    },
  });

export { getSession, commitSession, destroySession };
