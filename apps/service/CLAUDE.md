# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## How to handler error

- all errors are handled centrally in `src/error.ts`.
- `ErrorCode` is stored in `@repo/types/error`.
- use `createErrorResponse` to create error response.

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

1. add and modify schema in `src/db/schema`
2. run `pnpm run db:generate` to generate migrations
3. run `pnpx wrangler d1 migrations apply $db` to apply migration to database, db name can be found in `wrangler.jsonc`
