import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/db/migrations/",
        "src/__tests__/",
        "**/*.d.ts",
        "**/*.config.ts",
        "**/types/",
        "src/index.ts", // Main entry point, tested via integration
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    testTimeout: 10000,
    // setupFiles: ['./src/__tests__/setup.ts'], // Temporarily disabled
  },
});
