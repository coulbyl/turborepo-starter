# AGENTS — Workspace Instructions for AI Coding Agents

Purpose: Help AI agents be immediately productive in this monorepo by summarizing how to run, build, and test the project, where to find architectural context, and where to find project-specific agent skills.

Use when: triaging issues, running tests, making code changes in `apps/*`, `packages/*`, or updating infra/config. Trigger phrases: "dev", "build", "pnpm", "turbo", "prisma", "Playwright", "NestJS", "Next.js".

Quick commands
- **Start local dev**: `pnpm dev` (runs turbo pipelines for apps) — see [package.json](package.json)
- **Start services**: `docker-compose up` — starts Postgres, Redis, Mailpit — see [docker-compose.yml](docker-compose.yml)
- **API (apps/api)**: `pnpm -F api dev`, `pnpm -F api test`, `pnpm -F api test:e2e` — see [apps/api/package.json](apps/api/package.json)
- **Web (apps/web)**: `pnpm -F web dev`, `pnpm -F web build`, `pnpm -F web e2e` — see [apps/web/package.json](apps/web/package.json)
- **DB (packages/db)**: `pnpm -w -F db db:generate`, `pnpm -w -F db db:seed`, `pnpm -w -F db db:migrate` — see [packages/db/package.json](packages/db/package.json)

Environment notes / gotchas
- This is a pnpm + Turborepo monorepo. Use `pnpm` and `turbo` commands; do not assume `npm` or `yarn`.
- Many tasks depend on Docker services (Postgres, Redis). If tests or dev fail, check `docker-compose.yml` and environment variables.
- Prisma migrations are managed in `packages/db` — run migrations there before running API migrations.
- Turbo caching may affect incremental builds; prefer use of `pnpm -w` / `pnpm -F <pkg>` for package-scoped tasks when diagnosing.

Where to find context
- Architecture & docs: see [docs/](docs/) for design docs and decisions.
- Backend code: [apps/api/src/](apps/api/src/)
- Frontend code: [apps/web/](apps/web/)
- Shared schema & DB: [packages/db/prisma/schema.prisma](packages/db/prisma/schema.prisma)

Agent skills & helpers
- Repository contains curated skills for common tasks under `.agents/skills/`:
  - [nestjs-best-practices](.agents/skills/nestjs-best-practices/AGENTS.md) — NestJS guidance
  - [nextjs-app-router-patterns](.agents/skills/nextjs-app-router-patterns/) — Next.js patterns
  - [playwright-best-practices](.agents/skills/playwright-best-practices/) — E2E testing guidance

Guidelines for agent behavior
- Prefer linking to existing docs (do not copy large docs from `docs/`).
- Use targeted `applyTo` globs for file-level instructions; avoid always-on `applyTo: "**"` unless necessary.
- If running commands, prefer non-destructive ones first (lint, test), and prompt before running migrations or destructive DB resets.

If you need more targeted instructions (frontend-only or backend-only), ask to create a separate instructions file under `.github/` or an agent skill in `.agents/skills/`.
