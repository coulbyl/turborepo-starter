# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Identis

Identis is a **B2B RegTech SaaS** for francophone Africa. It lets organizations (fintechs, IMF/microfinance, real estate agencies) verify identities, score risk, and validate cases through configurable workflows — all compliant with BCEAO and ARDP regulations.

Two deployment modes:

- **Cloud** — multi-tenant SaaS, pay-per-verification wallet (500–1 800 FCFA/verification)
- **Dedicated** — self-hosted Docker Compose package, monthly license (75 000 FCFA/month)

The current codebase is a **boilerplate foundation** with auth, users, notifications, and announcements. The product modules (Workspace, Case, Verification, Rule Engine, Workflow, Form Builder, Entry Points, Wallet, API keys) are yet to be built.

---

## Commands

```bash
# Infrastructure (Postgres + Redis + Mailpit)
docker-compose up -d

# Dev — all apps
pnpm dev

# Scoped dev
pnpm -F api dev          # NestJS API on :3001
pnpm -F web dev          # Next.js on :3000

# Build
pnpm build
pnpm -F api build
pnpm -F web build

# Lint / typecheck
pnpm lint
pnpm typecheck

# API tests (Vitest)
pnpm -F api test              # unit
pnpm -F api test:watch
pnpm -F api test:e2e          # requires Docker (Testcontainers)

# Web E2E (Playwright)
pnpm -F web e2e
pnpm -F web e2e:ui

# Database
pnpm -F db db:migrate         # run pending migrations
pnpm -F db db:generate        # regenerate Prisma client after schema changes
pnpm -F db db:seed            # seed admin user (set SEED_ADMIN_PASSWORD first)
pnpm -F db db:studio
pnpm -F db db:reset           # destructive
```

---

## Monorepo layout

```
apps/api              NestJS REST API
apps/web              Next.js 15 frontend (App Router)
packages/db           Prisma schema + generated client (@identis/db)
packages/ui           Shared shadcn/Radix UI components (@identis/ui)
packages/transactional  React Email templates (@identis/transactional)
packages/eslint-config  Shared ESLint configs
packages/typescript-config  Shared tsconfig presets
```

---

## Target architecture — NestJS modules to build

The central entity is **Workspace** (a client organization). All business data is scoped by `workspaceId`.

| Module             | Responsibility                                                                       |
| ------------------ | ------------------------------------------------------------------------------------ |
| `WorkspaceModule`  | CRUD workspace, members, roles (Admin/Agent/Reviewer/Compliance/Developer), branding |
| `CaseModule`       | Create/track/search verification cases; holds score result and form data             |
| `VerifModule`      | Smile ID integration — Basic KYC, DocV, DocV+AML, Smile Secure (dedup)               |
| `RuleEngineModule` | Configurable risk rules (condition/operator/consequence), score 0–100                |
| `WorkflowModule`   | Multi-step validation pipeline, roles per step, delays, auto-escalation              |
| `FormModule`       | Dynamic form builder (text/number/select/upload/consent), sector templates           |
| `EntryPointModule` | One-time unique links for self-service candidate flow                                |
| `WalletModule`     | Prepaid balance, deductions per verification, recharge via Wave/Orange               |
| `ApiModule`        | External API keys (hashed), logs, webhooks, usage metering                           |
| `LicenseModule`    | Dedicated mode — license validation + 24h heartbeat to api.identis.ci                |
| `AdminModule`      | Super-admin — all workspaces, licenses, global metrics                               |

The boilerplate already has: `AuthModule`, `NotificationModule`, `AnnouncementsModule`, `AdminUsersModule`, `MailModule`, `RedisModule`.

---

## Key architectural decisions

**Multi-tenant isolation** — every Prisma query on business entities MUST include `WHERE workspaceId = X`. The `WorkspaceScopeGuard` enforces this at the HTTP layer. Implement it from Sprint 1 — retrofitting is expensive.

**Verification provider abstraction** — implement `IVerificationProvider` interface with `verifyDocument()`, `checkLiveness()`, `checkAML()` methods. Smile ID is the first implementation. This enables adding Verichap (local CI/UEMOA backup provider) later without changing business logic.

**Score ≠ Smile ID result** — Smile ID returns raw biometric data (liveness score, document valid, AML match). The Identis Rule Engine combines this with form data to compute a 0–100 score. Never expose Smile ID's raw score as the Identis score.

**Async verification flow** — Basic KYC is synchronous (<3s). Document Verification is async — Smile ID calls back via webhook. Use WebSocket (Socket.io) to push results to the dashboard. No polling — too expensive on 3G.

**Biometric data** — photos (CNI, selfie) are stored on Cloudflare R2 encrypted AES-256, never in PostgreSQL. Only the R2 URL is stored. Access requires a signed URL with 15-minute expiry. Auto-delete after 90 days via cron job.

**API keys** — stored as bcrypt hash only. Prefix pattern: `id_live_xxxx`. The raw key is returned once at creation and never retrievable again.

**Rule Engine caching** — rules are loaded from PostgreSQL, compiled in memory, cached in Redis with key `rules:{workspaceId}`, TTL 5 minutes. Cache is invalidated immediately on rule modification.

**Candidate flow resilience** — the `EntryPoint` entity stores `lastCompletedStep`. If a candidate loses connection mid-flow, they resume at the last completed step when reopening the link (before expiry).

---

## Data model overview

The full Prisma schema (to be implemented) centers on `Workspace`:

- `Workspace` → `Member[]`, `Case[]`, `Rule[]`, `WorkflowStep[]`, `FormTemplate[]`, `ApiKey[]`, `WalletTransaction[]`
- `Case` → `Verification?`, `StepHistory[]`, `EntryPoint?`
- `Verification` — Smile ID result: `smileJobId`, `livenessScore`, `documentValid`, `amlMatch`, `duplicateFound`, `rawResult` (Json), `cniPhotoUrl`, `selfiePhotoUrl`
- `Rule` — `condition`, `operator`, `value`, `consequence` (MALUS/BLOCK/ALERT), `malus` points
- `WorkflowStep` — `requiredRole`, `maxDelayHours`, `onExpiry` (ESCALATE/ALERT/AUTO_APPROVE), score thresholds
- `WalletTransaction` — `type` (INSCRIPTION/RECHARGE/DEDUCTION/REFUND), `amount` in FCFA, `balanceBefore`, `balanceAfter`

Current schema (`packages/db/prisma/schema.prisma`) only has the boilerplate models (User, Session, Notification, Announcement). The full schema above must be migrated in.

---

## ESLint / TypeScript rules — recurring gotchas

**`max-params` in NestJS**

The rule fires at the **first decorator** of a method, not at the method signature. Place the disable comment *before* `@Post()` / `@Get()` etc., not before `create(`:

```ts
// eslint-disable-next-line max-params   ← before the decorator
@Post()
@UseInterceptors(...)
create(@Param() ..., @Body() ..., @UploadedFiles() ..., @CurrentSession() ...) { ... }
```

For DI constructors, place it on the line immediately before `constructor(`. Prefer refactoring to an options object when the caller is your own code; reserve `eslint-disable` for NestJS infrastructure constraints (constructors with `@Inject`, decorated controller methods).

**`@typescript-eslint/require-await`**

Never use `async` on a method whose body only throws. Return `Promise.reject()` instead:

```ts
// ✗ async checkAml(...): Promise<AmlResult> { throw new UnprocessableEntityException(...); }
checkAml(...): Promise<AmlResult> {
  return Promise.reject(new UnprocessableEntityException(...));
}
```

**`@typescript-eslint/no-unnecessary-type-assertion`**

The rule can misfire on multi-line `(await expr()) as T` patterns. Split into two lines so the cast is unambiguous:

```ts
// ✗  const result = (await this.idApi.submit_job(...)) as Record<string, unknown>;
const raw = await this.idApi.submit_job(...);
const result = raw as Record<string, unknown>;
```

**NestJS DTO definite assignment**

In class-validator DTOs, required properties must carry the `!` suffix — TypeScript strict mode requires it:

```ts
// ✗  firstName: string;
firstName!: string;
```

**Unused imports**

Namespace imports (`Prisma`, `UserRole`) imported for their type only must use `import type { ... }`, or be removed entirely if nothing from them is referenced. Value imports that shadow the same name from another import also trigger this rule.

---

## Backend (`apps/api`)

- Path aliases: `@/` → `src/`, `@modules/` → `src/modules/`, `@utils/` → `src/utils/`
- `PrismaService` in `src/prisma.service.ts` — import as `@identis/db` from workspace packages
- Session auth via cookie `starter_session` (boilerplate) — will migrate to JWT (access 15min + refresh 7 days) for the product
- BullMQ queues backed by Redis — used for notification delivery and async Smile ID retry (5min → 15min → 1h → 4h → 24h)
- Logging: Pino structured JSON, import `createLogger` from `@utils/logger`

---

## Frontend (`apps/web`)

Two route groups:

- `app/(public)/` — unauthenticated (auth flows, candidate self-service flow)
- `app/dashboard/` — protected; `layout.tsx` redirects unauthenticated users to `/auth/login`

**API calls:**

- Server Components → `lib/api/server-api.ts` (`serverApiRequest<T>`) — forwards cookies automatically
- Client Components → `lib/api/client-api.ts` (`clientApiRequest<T>`) — sends `credentials: "include"`

**Domain layer** (`domains/<feature>/use-cases/`) — all API interactions live here, no direct fetch in components.

**i18n**: `next-intl`, messages in `messages/en.json` and `messages/fr.json`.

**UI**: `@identis/ui` (shadcn/Radix, Tailwind v4). App-specific components in `apps/web/components/`.

---

## Environment setup

Copy `.env.example` → `.env` (docker-compose) and `apps/api/.env.example` → `apps/api/.env` (API).

Critical production vars:

- `TOTP_APP_SECRET` — AES-256-GCM key for TOTP secrets; never rotate without migrating existing records
- `JWT_SECRET` + `JWT_REFRESH_SECRET` — 256-bit random, different values
- `SMILE_ID_PARTNER_ID` + `SMILE_ID_API_KEY` — from Smile ID portal (sandbox free, `SMILE_ID_ENV=0`)
- `R2_ACCOUNT_ID` + `R2_ACCESS_KEY_ID` + `R2_SECRET_ACCESS_KEY` + `R2_BUCKET_NAME` — Cloudflare R2
- `ENCRYPTION_KEY` — 32-byte hex for AES-256 (biometric data encryption)
- `WHATSAPP_PHONE_ID` + `WHATSAPP_TOKEN` — Meta Business API

---

## Security checklist (before any production deploy)

- `WorkspaceScopeGuard` on every business endpoint
- No secrets in git — env vars only
- HTTPS + Helmet.js headers active
- Nginx rate limiting: 100 req/min per IP globally, 1 000 req/hour per API key
- ClamAV sidecar active for file uploads
- R2 direct URL access disabled (signed URLs only)
- ARTCI declaration filed (required for biometric data collection in CI)
- Sentry configured with no PII in logs

---

## Docs

Full product documentation is in `docs/`:

- `Identis_Architecture_v1.md` — detailed tech architecture, data model, API reference
- `Identis_PRD_v1.md` — product requirements, user stories by segment
- `Identis_Roadmap_v1.md` — 18-month roadmap, 4 phases, feature backlog
- `Identis_BizModel_v1.md` — pricing, margins, financial projections
- `Identis_Decisions_v1.md` — 26 product & legal decisions (mandatory reading before implementing any module)
- `Identis_Complement_v1.md` — GTM scripts, QA test cases, CGU clauses, brand identity, security plan
- `Identis_UXUI_v1.md` — design system, user flows, component patterns
