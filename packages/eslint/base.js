import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import onlyWarn from "eslint-plugin-only-warn";
import importPlugin from "eslint-plugin-import";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = tseslint.config([
  js.configs.recommended,
  eslintConfigPrettier,
  // ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  // importPlugin.flatConfigs.recommended,
  // importPlugin.flatConfigs.typescript,
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    settings: {
      "import/resolver": {
        typescript: {
          project: [
            "./tsconfig.json",
            "./apps/*/tsconfig.json",
            "./packages/*/tsconfig.json",
          ],
        },
      },
    },
  },
  {
    plugins: {
      turbo: turboPlugin,
      onlyWarn,
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      import: importPlugin, // 明确在此对象中启用 import 插件
    },
    settings: {
      "import/resolver": {
        typescript: {
          // 这些路径是相对于项目根目录的，看起来是正确的
          project: [
            "./tsconfig.json",
            "./apps/*/tsconfig.json",
            "./packages/*/tsconfig.json",
          ],
        },
      },
    },
    rules: {
      "import/no-relative-packages": "error",
      "import/extensions": [
        "error",
        "ignorePackages",
        {
          ts: "never",
          tsx: "never",
          js: "never",
          jsx: "never",
        },
      ],
    },
  },
]);
