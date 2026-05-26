# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start all services (Postgres, Redis, Mailpit)
docker-compose up -d

# Dev — all apps in parallel
pnpm dev

# Scoped dev
pnpm -F api dev          # NestJS API on :3001
pnpm -F web dev          # Next.js on :3000

# Build
pnpm build               # all packages via turbo
pnpm -F api build
pnpm -F web build

# Lint / typecheck
pnpm lint
pnpm typecheck

# Tests (API — Vitest)
pnpm -F api test              # unit tests
pnpm -F api test:watch        # watch mode
pnpm -F api test:e2e          # e2e (uses Testcontainers — requires Docker)

# E2E (web — Playwright)
pnpm -F web e2e
pnpm -F web e2e:ui

# Database (run from packages/db)
pnpm -F db db:migrate         # run pending migrations
pnpm -F db db:generate        # regenerate Prisma client after schema changes
pnpm -F db db:seed            # seed admin user (requires SEED_ADMIN_PASSWORD)
pnpm -F db db:studio          # Prisma Studio GUI
pnpm -F db db:reset           # destructive: reset + re-migrate
```

## Architecture

### Monorepo layout

```
apps/api          NestJS REST API
apps/web          Next.js 15 frontend (App Router)
packages/db       Prisma schema + generated client
packages/ui       Shared shadcn/Radix component library
packages/transactional  React Email templates (email-verification, password-reset)
packages/eslint-config  Shared ESLint configs (base / nest / next / react-internal)
packages/typescript-config  Shared tsconfig presets
```

### Backend (`apps/api`)

NestJS application with feature modules under `src/modules/`:

- **auth** — session-based auth (cookie `starter_session`), email OTP, TOTP/TOTP-QR, password reset. No JWT. Sessions are hashed tokens stored in Postgres.
- **admin-users** — admin CRUD over users, generate password-reset links
- **announcements** — CMS announcements (admin CRUD + public read)
- **notification** — in-app notifications with per-user read tracking via BullMQ + Redis
- **mail** — nodemailer wrapper; dev uses Mailpit (`:8025`)

`PrismaService` wraps the generated `@prisma/client` and is provided globally via `PrismaModule`. Import it from `@/prisma.service` inside the API, or import `@identis/db` from the workspace.

The API uses `@modules/...` and `@utils/...` path aliases (see `tsconfig.json`).

### Frontend (`apps/web`)

Next.js App Router with two layout trees:

- `app/(public)/` — unauthenticated pages (auth flows)
- `app/dashboard/` — protected; `layout.tsx` calls `getCurrentSession()` server-side and redirects to login if absent, then wraps children in `CurrentUserProvider`

**Domain layer** (`domains/<feature>/`): all API calls and types live here, split into `use-cases/` (functions) and `types/`. There is no dedicated API client class — calls go through two thin helpers:

- `lib/api/server-api.ts` — `serverApiRequest<T>()` for Server Components; forwards cookies automatically
- `lib/api/client-api.ts` — `clientApiRequest<T>()` for Client Components; sends `credentials: "include"`

Both helpers target `BACKEND_URL` (default `http://localhost:3001`).

**i18n**: `next-intl` with `messages/en.json` and `messages/fr.json`.

**UI**: Components in `packages/ui` (shadcn-based, Tailwind v4). App-specific components live in `apps/web/components/`.

### Database (`packages/db`)

Prisma schema at `packages/db/prisma/schema.prisma`. Models: `User`, `Session`, `EmailVerificationCode`, `PasswordResetToken`, `Notification`, `UserNotificationRead`, `Announcement`.

PKs use `uuidv7()` (Postgres extension). After schema changes, run `db:generate` before building the API.

### Environment setup

Copy `.env.example` → `.env` (docker-compose vars) and `apps/api/.env.example` → `apps/api/.env` (API vars). Critical vars:

- `DATABASE_URL` — Postgres connection string
- `TOTP_APP_SECRET` — AES-256-GCM key for encrypting TOTP secrets at rest; never rotate without migrating existing records
- `CORS_ORIGIN` / `AUTH_COOKIE_DOMAIN` — must match frontend origin in production
