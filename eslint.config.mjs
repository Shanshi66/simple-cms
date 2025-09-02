import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";

export default tseslint.config(
    js.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        linterOptions: {
            noInlineConfig: true,
        }
    },
    {
        plugins: {
            turbo: turboPlugin,
        },
    },
    {
        files: ['**/*.{ts,tsx}'],
        rules: {
            '@typescript-eslint/no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['../*', '../../*', '../../../*'],
                            message: 'Relative imports are not allowed. Use absolute imports instead.',
                        },
                        {
                            group: ['*/*.js', '*/*.jsx', '*/*.ts', '*/*.tsx'],
                            message: 'Do not use extensions in imports.',
                        },
                    ],
                },
            ],
        },

    },
    {
        ignores: ['**/.turbo', '**/dist', '**/node_modules', "**/.react-router", "**/worker-configuration.d.ts"],
    },
    {
        files: ['**/*.js', "**/*.mjs", "**/*.cjs"],
        extends: [tseslint.configs.disableTypeChecked],
    },
    // turn off rules may conflict with prettier
    eslintConfigPrettier,
);
