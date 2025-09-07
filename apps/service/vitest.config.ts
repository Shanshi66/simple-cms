import {
  defineWorkersProject,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers/config";
import path from "node:path";

export default defineWorkersProject(async () => {
  const migrationsPath = path.join(__dirname, "./src/db/migrations");
  const migrations = await readD1Migrations(migrationsPath);
  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      setupFiles: ["./test/apply-migrations.ts"],
      globals: true,
      isolate: true,
      poolOptions: {
        workers: {
          singleWorker: true,
          wrangler: { configPath: "./wrangler.jsonc" },
          miniflare: {
            bindings: { TEST_MIGRATIONS: migrations },
          },
        },
      },
    },
  };
});
