# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

- `pnpm dev` - Start all apps in development mode
- `pnpm dev --filter=web` - Start only the React frontend
- `pnpm dev --filter=service` - Start only the Hono API service
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Lint all packages
- `pnpm check-types` - Type check all packages

### Web App Specific

- `pnpm --filter=web check-types` - Generate types and run TypeScript checks
- `pnpm --filter=web cf-typegen` - Generate Cloudflare Workers types
- `pnpm --filter=web deploy` - Build and deploy to Cloudflare Pages

### Service App Specific

- `pnpm --filter=service db:generate` - Generate database migrations
- `pnpm --filter=service db:migrate` - Run database migrations
- `pnpm --filter=service deploy` - Deploy to Cloudflare Workers
- `pnpm --filter=service test` - Run tests with Vitest
- `pnpm --filter=service test:ui` - Run tests with Vitest UI
- `pnpm --filter=service test:run` - Run tests once
- `pnpm --filter=service test:coverage` - Run tests with coverage report

### Package Development

- `pnpm --filter=@repo/ui build` - Build UI package
- `pnpm --filter=@repo/ui check-types` - Type check UI package
- `scripts/db.sh` - Generate Better Auth schema (runs `@better-auth/cli generate`)

### Template Creation

- `node scripts/create-project.js` - Interactive script to create a new project from this template
- `./scripts/setup-template.sh` - Setup script to prepare this project as a publishable template

## Architecture Overview

### Monorepo Structure

This is a Turborepo monorepo with two main applications and shared packages:

**Applications:**

- `apps/web` - React 19 frontend with React Router 7, deployed to Cloudflare Pages
- `apps/service` - Hono API backend deployed to Cloudflare Workers

**Shared Packages:**

- `@repo/ui` - shadcn/ui component library with Tailwind CSS 4, includes theme provider and common components
- `@repo/tsconfig` - Shared TypeScript configurations (base, react, cloudflare variants)
- `@repo/types` - Shared TypeScript type definitions (i18n, ui types)
- `@repo/utils` - Shared utility functions

### Key Technologies

**Frontend (apps/web):**

- React 19 with React Router 7 for routing and SSR
- Tailwind CSS 4 for styling
- i18next for internationalization (English/Chinese)
- Vite as build tool with Cloudflare Pages adapter
- Better Auth for client-side authentication

**Backend (apps/service):**

- Hono framework for API routes
- Drizzle ORM with Cloudflare D1 (SQLite) database
- Better Auth for authentication and session management
- Vitest for testing with UI and coverage support
- Deployed to Cloudflare Workers

### Internationalization

The web app supports multiple locales defined in `apps/web/app/i18n/index.ts`:

- English (en) - default
- Chinese (zh-CN)

Locale handling is integrated into the routing system, with locale detection from URL paths. Message files are organized by locale in `apps/web/app/i18n/messages/`.

### Database Schema

Authentication system with tables defined in `apps/service/src/db/schema/auth.ts`:

- `user` - User profiles with email verification, timestamps, and optional creem_id
- `session` - User sessions with token management, IP address, and user agent tracking
- `account` - OAuth provider accounts with token management
- `verification` - Email/phone verification codes with expiration

Database uses Drizzle ORM with Cloudflare D1 HTTP driver configured in `drizzle.config.ts`.

### Git Hooks and Commit Conventions

The repository uses conventional commits enforced by commitlint:

- Commit types: `init`, `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`, `chore`
- Maximum header length: 100 characters
- Husky manages pre-commit hooks with lint-staged for automatic ESLint fixes and Prettier formatting

### Code Quality and Linting

The project uses a modern ESLint flat configuration with:

- TypeScript ESLint recommended and stylistic rules
- Turbo plugin for monorepo-specific linting
- Strict import rules: no relative imports (`../`, `../../`), no file extensions in imports
- Prettier integration for consistent code formatting
- Project-wide type checking with TypeScript service

### Deployment

Both applications are configured for Cloudflare deployment:

- Web app uses React Router 7's Cloudflare Pages adapter with SSR
- Service uses Wrangler for Workers deployment with D1 database
- Shared worker configuration in `worker-configuration.d.ts`
- Environment variables required: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_DATABASE_ID`, `CLOUDFLARE_D1_TOKEN`
- Package manager: pnpm@10.15.0
- Node.js version requirement: >=18

### Development Workflow

1. Run `pnpm install` to install dependencies
2. Generate Cloudflare types: `pnpm --filter=web cf-typegen` and `pnpm --filter=service cf-typegen` (automatically run via postinstall for web app)
3. Use `pnpm dev` for local development of both apps
4. Code quality checks:
   - ESLint and Prettier formatting are automatically applied via lint-staged on pre-commit
   - Run `pnpm lint` manually for project-wide linting
   - Run `pnpm check-types` for TypeScript type checking across all packages
5. Testing:
   - Service: `pnpm --filter=service test` (Vitest with UI and coverage options)
   - Utils: `pnpm --filter=utils test` (Vitest)
6. Database changes require:
   - Update schema files in `apps/service/src/db/schema/`
   - Run `pnpm --filter=service db:generate` to create migrations
   - Run `pnpm --filter=service db:migrate` to apply migrations
7. Better Auth schema updates: Run `scripts/db.sh` to regenerate auth schema
