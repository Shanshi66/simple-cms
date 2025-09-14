# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Structure

This is a monorepo with two main applications and shared packages:

**Applications:**

- `apps/blog-library` - Headless CMS frontend blog library for managing multi-site blog content, check more information in `apps/blog-library/CLAUDE.md`
- `apps/service` - Hono API backend deployed to Cloudflare Workers, check more information in `apps/service/CLAUDE.md`

**Shared Packages:**

- `@repo/tsconfig` - Shared TypeScript configurations (base, react, cloudflare variants)
- `@repo/types` - Shared TypeScript type definitions (i18n, ui types), check more information in `packages/types/CLAUDE.md`

## Code Quality

The project uses a modern ESLint flat configuration with:

- TypeScript ESLint recommended and stylistic rules
- Strict import rules: no relative imports (`../`, `../../`), no file extensions in imports
- Use as less `any` as possible
- Prettier integration for consistent code formatting
- Project-wide type checking with TypeScript service

## Commit Quality

The repository uses conventional commits enforced by commitlint:

- Commit types: `init`, `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`, `chore`
- Maximum header length: 100 characters
- Husky manages pre-commit hooks with lint-staged for automatic ESLint fixes and Prettier formatting

## Development Commands

Execute commands on all apps and packages:

- `pnpm run dev` - Start development servers for all apps
- `pnpm run test` - Run tests across all apps and packages
- `pnpm run lint` - Run ESLint across the project
- `pnpm run check-types` - Run TypeScript type checking on all apps

Execute commands on specific apps or packages using the `--filter` flag:

- `pnpm --filter=service run test` - Run tests only in `apps/service`
