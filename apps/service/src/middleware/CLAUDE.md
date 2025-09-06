# CLAUDE.md

## How to create middleware

```ts
const logger = createMiddleware(async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`);
  await next();
});
```
