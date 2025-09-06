# CLAUDE.md

## How to create index

```ts
export const table = sqliteTable(
  "tableName",
  {
    id: text("id").primaryKey(),
    field: text("field").notNull()
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_api_keys_key_hash").on(table.keyHash),
    index("idx_table_field").on(table.field),
  ],
);
```
