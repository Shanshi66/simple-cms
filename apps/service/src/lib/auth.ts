import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { CFBindings } from "@/types/context";
import { drizzle } from "drizzle-orm/d1";

export const createAuth = (binding: CFBindings) => {
  const db = drizzle(binding.DB, { casing: "snake_case" });
  return betterAuth({
    secret: binding.BETTER_AUTH_SECRET,
    baseURL: binding.BASE_URL,
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),
    trustedOrigins: [binding.BASE_URL, binding.CLIENT_URL],
    session: {
      // https://www.better-auth.com/docs/concepts/session-management#cookie-cache
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60, // Cache duration in seconds
      },
      // https://www.better-auth.com/docs/concepts/session-management#session-expiration
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      // https://www.better-auth.com/docs/concepts/session-management#session-freshness
      // https://www.better-auth.com/docs/concepts/users-accounts#authentication-requirements
      // disable freshness check for user deletion
      freshAge: 0 /* 60 * 60 * 24 */,
    },
    emailAndPassword: {
      enabled: true,
      // https://www.better-auth.com/docs/concepts/email#2-require-email-verification
      requireEmailVerification: true,
      // https://www.better-auth.com/docs/authentication/email-password#forget-password
    },
    emailVerification: {
      // https://www.better-auth.com/docs/concepts/email#auto-signin-after-verification
      autoSignInAfterVerification: true,
      // https://www.better-auth.com/docs/authentication/email-password#require-email-verification
    },
    socialProviders: {
      // https://www.better-auth.com/docs/authentication/google
      google: {
        clientId: binding.GOOGLE_CLIENT_ID,
        clientSecret: binding.GOOGLE_CLIENT_SECRET,
      },
    },
    account: {
      // https://www.better-auth.com/docs/concepts/users-accounts#account-linking
      accountLinking: {
        enabled: true,
        trustedProviders: ["google"],
      },
    },
    user: {
      // https://www.better-auth.com/docs/concepts/database#extending-core-schema
      additionalFields: {
        creemId: {
          type: "string",
          required: false,
        },
      },
      // https://www.better-auth.com/docs/concepts/users-accounts#delete-user
      deleteUser: {
        enabled: true,
      },
    },
    plugins: [],
  });
};

// for cli
// npx @better-auth/cli@latest generate
// const auth = createAuth({} as CFBindings);
