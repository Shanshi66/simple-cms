# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## How to handler error

- all errors are handled centrally in `src/error.ts`.
- `ErrorCode` is stored in `@repo/types/error`.
- use `createErrorResponse` to create error response.
- Use try-catch as little as possible.

## How to validate route params

use `@hono/zod-validator` middleware to validate route param

```javascript
import { zValidator } from "@hono/zod-validator";
const route = app.post("/posts", zValidator("form", schema), (c) => {
  const validated = c.req.valid("form");
  // ... use your validated data
});
```

Schemas that are only used in the service should be stored in `src/types`. If a schema needs to be shared with other apps, it should be stored in `@repo/types`.

## How to generate and apply migration

1. Add and modify schema in `src/db/schema`
2. Run `pnpm run db:generate` to generate migrations
3. Run `pnpx wrangler d1 migrations apply $db` to apply migration to database, db name can be found in `wrangler.jsonc`

## How to write test

### Unit tests

1. Add unit tests for functions, middlewares and other. Especially for those in `lib` and `middleware`.

### Integration tests

1. Use `@cloudflare/vitest-pool-workers` library, `import { env } from 'cloudflare:test'` to use cloudflare bindings
2. Add integration tests for each route in `routes` and set test file in `routes`.
3. DO NOT check `message` field in test, just check `success`, `error code`, `status code`, `data` fields
4. Import hono instance as `app` from `route` that need to test, DO NOT create hono instance.
5. Add `env` to every request, avoid to mock env, `const res = await app.request("/sites/test-site/articles", {}, env);`
