import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema/index";

export type D1DB = DrizzleD1Database<typeof schema>;

export function createDb(db: D1Database): D1DB {
  return drizzle(db, { casing: "snake_case" });
}
