# AGENTS — Workspace Instructions for AI Coding Agents

Purpose: help coding agents become productive quickly in this monorepo by documenting the real project structure, safe commands, local dependencies, and where to find architecture and product context.

Use when: working anywhere in `apps/*` or `packages/*`, running local tooling, updating infra/config, or trying to understand how the API, web app, and shared packages fit together.

## Workspace Snapshot

- Product: `Identis`, a Francophone Africa identity verification and dossier-validation platform.
- Monorepo: `pnpm` + `Turborepo`
- Runtime: Node `>=22`
- Main apps:
  - `apps/api`: NestJS backend
  - `apps/web`: Next.js App Router frontend
- Shared packages:
  - `packages/db`: Prisma schema, generated client, DB utilities
  - `packages/ui`: shared UI components and styles
  - `packages/transactional`: React email templates
  - `packages/eslint-config`, `packages/typescript-config`: shared tooling config

## Quick Commands

- Install dependencies: `pnpm install`
- Start all local apps: `pnpm dev`
- Build all packages/apps: `pnpm build`
- Lint workspace: `pnpm lint`
- Typecheck workspace: `pnpm typecheck`

### Package-scoped commands

- API dev: `pnpm -F api dev`
- API tests: `pnpm -F api test`
- API e2e tests: `pnpm -F api test:e2e`
- Web dev: `pnpm -F web dev`
- Web production build: `pnpm -F web build`
- Web e2e: `pnpm -F web e2e`
- Prisma generate: `pnpm -F @identis/db db:generate`
- Prisma migrate: `pnpm -F @identis/db db:migrate`
- Prisma seed: `pnpm -F @identis/db db:seed`

Prefer `pnpm -F <package>` when diagnosing or iterating on a single app/package. Use root scripts when the task genuinely spans the workspace.

## Local Services

`docker-compose.yml` starts the local service dependencies:

- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`
- Mailpit SMTP on `localhost:1025`
- Mailpit UI on `http://localhost:8025`

Start them with:

```bash
docker-compose up -d
```

If API startup, queues, email, or DB-backed tests fail, check Docker services first before assuming application bugs.

## Environment Notes

- Root `.env` configures Docker-facing infrastructure variables.
- Backend runtime variables live separately in `apps/api/.env` if present in your local setup.
- The API defaults to `http://localhost:3001`.
- The web app defaults to `http://localhost:3000`.
- The frontend talks to the backend via `NEXT_PUBLIC_API_URL`, falling back to `http://localhost:3001`.
- Prisma reads `DATABASE_URL` from the environment.
- Redis defaults to `localhost:6379`.

## Architecture Map

### Backend

- Entry point: [apps/api/src/main.ts](apps/api/src/main.ts)
- Root module: [apps/api/src/app.module.ts](apps/api/src/app.module.ts)
- Main feature modules currently include:
  - `auth`
  - `admin-users`
  - `announcements`
  - `notification`
  - `mail`
- Common infrastructure:
  - Prisma service/module in `apps/api/src/prisma.*`
  - Redis module in `apps/api/src/common/redis/`

### Frontend

- App Router root: [apps/web/app/](apps/web/app/)
- Public auth flow: `apps/web/app/(public)/auth/`
- Dashboard area: `apps/web/app/dashboard/`
- Domain-oriented client code: `apps/web/domains/`
- Shared API helpers: `apps/web/lib/api/`
- Localized messages: `apps/web/messages/`

### Database

- Prisma schema: [packages/db/prisma/schema.prisma](packages/db/prisma/schema.prisma)
- Prisma config: [packages/db/prisma.config.ts](packages/db/prisma.config.ts)
- DB package source: [packages/db/src/](packages/db/src/)

### Shared UI and Emails

- Shared components: [packages/ui/src/components/](packages/ui/src/components/)
- Shared styles: `packages/ui/src/styles/`
- Transactional emails: [packages/transactional/src/emails/](packages/transactional/src/emails/)

## Docs and Product Context

Start with these files when you need product or UX intent before changing code:

- [README.md](README.md)
- [docs/Identis_PRD_v1.md](docs/Identis_PRD_v1.md)
- [docs/Identis_Roadmap_v1.md](docs/Identis_Roadmap_v1.md)
- [docs/Identis_UXUI_v1.md](docs/Identis_UXUI_v1.md)

Prefer linking to these docs instead of copying large sections into new files or comments.

## Testing Guidance

- Use narrow, package-scoped checks first.
- Good first passes:
  - `pnpm -F api test`
  - `pnpm -F web build`
  - `pnpm -F web e2e`
- API e2e uses Vitest config under `apps/api/test/`.
- Web e2e uses Playwright.

If a change touches DB access, auth, queues, or email flows, assume local services may be required.

## Turborepo Guidance

- This repo uses package tasks, not root task logic.
- Keep task definitions inside each package `package.json`.
- Root `package.json` should stay as a thin wrapper around `turbo run ...`.
- When adding a new task across packages, update both:
  - the relevant package `package.json`
  - [turbo.json](turbo.json)

Avoid introducing one-off root scripts that bypass Turbo orchestration.

## Agent Skills Available In-Repo

- [nestjs-best-practices](.agents/skills/nestjs-best-practices/AGENTS.md)
- [nextjs-app-router-patterns](.agents/skills/nextjs-app-router-patterns/SKILL.md)
- [playwright-best-practices](.agents/skills/playwright-best-practices/SKILL.md)
- [shadcn](.agents/skills/shadcn/SKILL.md)
- [turborepo](.agents/skills/turborepo/SKILL.md)

Use the matching skill when the task clearly falls into one of those areas.

## Safety Rules For Agents

- Use `pnpm`, not `npm` or `yarn`.
- Prefer non-destructive commands first: `lint`, `typecheck`, targeted tests, read-only inspection.
- Do not run `db:reset` or destructive Prisma commands unless explicitly asked.
- Do not overwrite user changes already present in the worktree.
- Prefer minimal, package-scoped verification before running full workspace commands.
- When editing docs or product copy, keep terminology aligned with `Identis` rather than the original starter template wording.

## UI Components — Always Use `@identis/ui`

In `apps/web`, **never write raw HTML elements** when an `@identis/ui` component exists for it. This is a hard rule, not a preference.

| Raw HTML                                                | Use instead                                                                                                                          |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `<button>`                                              | `Button` from `@identis/ui/components/button`                                                                                        |
| `<input>`                                               | `Input` from `@identis/ui/components/input`                                                                                          |
| `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` from `@identis/ui/components/table`                        |
| `<select>`                                              | `Select` from `@identis/ui/components/select`                                                                                        |
| Pagination buttons                                      | `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationPrevious`, `PaginationNext` from `@identis/ui/components/pagination` |
| `<textarea>`                                            | `Textarea` from `@identis/ui/components/textarea`                                                                                    |

Before building a UI feature, check `packages/ui/src/components/` to see what's available. Use `@identis/ui/components/<name>` for components not explicitly listed in `package.json#exports`.

## Form Fields — Always Use `apps/web/components/form-fields`

In `apps/web`, **never write inline `<Controller>` or `<FormField>` blocks** for standard input types. Use the pre-built RHF-integrated components from `apps/web/components/form-fields/`:

| Need                   | Component        |
| ---------------------- | ---------------- |
| Text input             | `InputField`     |
| Multiline text         | `TextareaField`  |
| Fixed options dropdown | `SelectField`    |
| Searchable dropdown    | `ComboboxField`  |
| Country selector       | `CountryField`   |
| Single date            | `DateField`      |
| Date range             | `DateRangeField` |
| File upload            | `FileField`      |

Import: `import { InputField, SelectField, ... } from "@/components/form-fields";`

These components handle RHF binding, Zod error display, and consistent styling out of the box. Only build a new form-field component if none of the above fit the use case.

## Confirmation Dialogs — Always Use `ConfirmDialog`

Never write an inline confirmation `Dialog`. Use `apps/web/components/confirm-dialog.tsx`:

```tsx
<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  title="Delete …"
  description="This action is irreversible."
  confirmLabel="Delete"
  loading={mutation.isPending}
  onConfirm={handleConfirm}
/>
```

## Table Pagination — Always Use `TablePagination`

Never write inline pagination logic (totalPages calc, prev/next buttons, item count). Use `apps/web/components/table-pagination.tsx`:

```tsx
<TablePagination
  page={page}
  total={data.total}
  limit={data.limit}
  onPageChange={setPage}
  itemLabel="dossier"
/>
```

The component returns `null` automatically when `total <= limit`, so no conditional wrapper needed.

## Known Lint & Typecheck Rules

These rules have caused repeated failures — check them before submitting a lint/typecheck pass.

**`max-params` — placement of the disable comment**

ESLint reports the error at the **first decorator** of a NestJS method. The disable comment must go on the line immediately before that decorator, not before the method name:

```ts
// eslint-disable-next-line max-params   ← directly above @Post/@Get/etc.
@Post()
@UseInterceptors(...)
create(@Param() ..., @Body() ..., @UploadedFiles() ..., @CurrentSession() ...) {}
```

For DI constructors, the comment goes on the line immediately before `constructor(`.

Prefer refactoring to an options object (`options: { a, b, c, d }`) when the caller is own code. Use `eslint-disable` only for NestJS infrastructure constraints (DI constructors with `@Inject`, decorated controller methods).

**`require-await` — methods that only throw**

A method with `async` but no `await` triggers this rule. If the body only throws, remove `async` and return `Promise.reject()`:

```ts
checkAml(...): Promise<AmlResult> {
  return Promise.reject(new UnprocessableEntityException('...'));
}
```

**`no-unnecessary-type-assertion` — multi-line await cast**

The `(await longCall()) as T` pattern can misfire. Split into two statements:

```ts
const raw = await this.idApi.submit_job(...);
const result = raw as Record<string, unknown>;
```

**NestJS DTOs — definite assignment**

Required properties in class-validator DTOs need the `!` suffix under strict mode:

```ts
firstName!: string;   // ✓
firstName: string;    // ✗ → TS2564
```

**Unused imports**

Use `import type { Foo }` for types never referenced as values. Remove namespace imports (`Prisma`, `UserRole`) that appear in the import list but are never used in the file body.

---

## Good First Reads For Common Tasks

- Backend bug or endpoint work: `apps/api/src/main.ts`, `apps/api/src/app.module.ts`, then the relevant module in `apps/api/src/modules/`
- Frontend page or flow work: matching route in `apps/web/app/`, then related logic in `apps/web/domains/`
- DB or schema work: `packages/db/prisma/schema.prisma`, then `packages/db/package.json`
- Build/task issues: `package.json`, `turbo.json`, `pnpm-workspace.yaml`

If more granular instructions are needed, add a focused skill under `.agents/skills/` or a narrower instruction file close to the code it governs.
