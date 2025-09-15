# Repository Guidelines

## Project Structure & Module Organization

- `src/`: SvelteKit app source.
    - `src/lib/`: reusable components, elements, actions, helpers, stores, charts, images.
    - `src/routes/`: route groups and pages (e.g., `+layout.svelte`, `+page.ts`).
    - `src/themes/`, `hooks.*.ts`, `service-worker.ts`: app-wide setup.
- `static/`: public assets served as-is.
- `build/`: compiled output (local builds).
- `e2e/`: Playwright tests (`helpers/`, `journeys/`, `steps/`).
- Tooling: `eslint.config.js`, `.prettierrc`, `playwright.config.ts`, `vitest-setup-client.ts`.

## Build, Test, and Development Commands

- `pnpm dev`: start Vite dev server.
- `pnpm build`: production build via `build.js`.
- `pnpm preview`: preview the production build.
- `pnpm check`: Svelte/TS diagnostics.
- `pnpm format` / `pnpm lint`: format with Prettier, then lint with ESLint.
- `pnpm test` | `pnpm test:watch` | `pnpm test:ui`: run Vitest (unit/component tests).
- `pnpm e2e` | `pnpm e2e:ui`: run Playwright tests; config auto-builds and serves.
  Requires Node >= 20 and pnpm (see `packageManager`).

## Coding Style & Naming Conventions

- Language: TypeScript + Svelte.
- Prettier: 4‑space indentation, single quotes, width 100, bracketSameLine.
- Svelte files: PascalCase components in `src/lib`, route files follow SvelteKit (`+page.svelte`, `+layout.ts`).
- Variables/functions: `camelCase`; constants: `SCREAMING_SNAKE_CASE`; types/interfaces: `PascalCase`.
- Keep logic in `$lib` and thin route loaders/actions.

## Testing Guidelines

- Unit/component: Vitest + Testing Library.
    - Place near source or under `src/`; name `*.test.ts`/`*.test.svelte`.
    - Run with `pnpm test`.
- End‑to‑end: Playwright under `e2e/`.
    - Start with `pnpm e2e` (uses `playwright.config.ts` to build/preview on port 4173).

## Commit & Pull Request Guidelines

- Branch names: `TYPE-ISSUEID-short-description` (e.g., `feat-1234-add-billing-chart`).
- Commits: imperative, concise, reference issues when relevant.
- PRs: clear description, linked issues, screenshots/GIFs for UI changes, test coverage notes, and checklist of affected areas.
- Keep PRs focused; include `pnpm format`, `pnpm lint`, `pnpm check`, and `pnpm test` clean runs before requesting review.

## Security & Configuration Tips

- Do not commit secrets; use `.env` based on `.env.example`.
- Sentry/Stripe and other public keys are configured via env vars; prefer `PUBLIC_` prefix for client‑exposed values.
- Use `compose.yml`/`Dockerfile` for containerized workflows when needed.
