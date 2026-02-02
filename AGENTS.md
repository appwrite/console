# Appwrite Console - Copilot Instructions

## Repository Overview

Appwrite Console is the web-based GUI for the Appwrite backend-as-a-service platform. Single-page application built with
**Svelte 5 + SvelteKit 2**, **TypeScript** (not strict mode), **Vite 7**, tested with **Vitest + Playwright**. Package
manager/runtime: **Bun** (Node 20+ optional for tooling). ~1500 files with extensive component-based architecture.

## Critical Build & Test Commands

### Setup (REQUIRED before any commands)

1. **Install Bun**:
    - Linux & macOS: `curl -fsSL https://bun.sh/install | bash`
    - Windows: `powershell -c "irm bun.sh/install.ps1 | iex"`
2. **Create .env**: `cp .env.example .env` (configure `PUBLIC_APPWRITE_ENDPOINT` and `PUBLIC_CONSOLE_MODE`)
3. **Configure network access** (if using GitHub Actions or restricted environments):
    - Ensure firewall/proxy allows access to: `pkg.pr.new`, `pkg.vc`, `registry.npmjs.org`
    - These domains are required for dependencies: `@appwrite.io/console`, `@appwrite.io/pink-icons-svelte`,
      `@appwrite.io/pink-svelte`
    - In GitHub Actions: Ensure Bun is installed and registry access is configured
    - If network errors persist, check proxy settings: `npm config get proxy` and `npm config get https-proxy`
4. **Install dependencies**: `bun install --frozen-lockfile` (if pkg.pr.new/pkg.vc fail due to network restrictions,
   installation may still succeed with cached versions)

### Development Commands

**Standard workflow**: `check` → `lint` → `test` → `build` (before committing)

- `bun run check` - TypeScript/Svelte validation (~30-60s)
- `bun run lint` - ESLint check (~10-20s)
- `bun run format` - Auto-fix Prettier formatting
- `bun run test` - Bun unit tests with TZ=EST (~10-30s)
- `bun run build` - Production build via build.js (~60-120s)
- `bun run dev` - Dev server on port 3000
- `bun run preview` - Preview build on port 4173
- `bun run e2e` - Playwright tests (needs `bunx playwright install --with-deps chromium` first, ~120s+)

**CI Pipeline** (`.github/workflows/tests.yml`): audit → install → check → lint → test → build

## Project Structure

```
src/
├── lib/                    # Reusable logic ($lib alias)
│   ├── components/         # Feature components (billing, domains, permissions, etc.)
│   ├── elements/           # Basic UI elements
│   ├── helpers/            # Utility functions (array, date, string, etc.)
│   ├── stores/             # Svelte stores for state
│   ├── sdk/                # Appwrite SDK wrappers
│   └── constants.ts, flags.ts, system.ts
├── routes/
│   ├── (console)/          # Auth-required routes
│   │   ├── organization-[organization]/
│   │   └── project-[region]-[project]/  # databases, functions, messaging, storage
│   └── (public)/           # Public routes (login, register, auth callbacks)
├── themes/                 # Theme definitions ($themes alias)
└── app.html, hooks.{client,server}.ts, service-worker.ts
```

**SvelteKit conventions**: `+page.svelte` (component), `+page.ts` (data loader), `+layout.svelte` (wrapper),
`+error.svelte` (errors). Groups like `(console)` organize routes without affecting URLs. Dynamic params: `[param]`.

## Key Configuration

**svelte.config.js**: Adapter = static SPA (fallback: index.html), base path `/console`, aliases: `$lib`, `$routes`,
`$themes`  
**vite.config.ts**: Dev port 3000  
**tsconfig.json**: Extends `.svelte-kit/tsconfig.json`, **NOT strict mode** (`strict: false`)  
**eslint.config.js**: Flat config (ESLint 9+), many rules disabled (see TODOs)  
**.prettierrc**: 4 spaces, single quotes, 100 char width, no trailing commas

## Testing

**Unit (Bun test)**: Tests in `src/lib/helpers/*.test.ts`, run with `TZ=EST` (timezone matters). Setup mocks SvelteKit (
`$app/*`) in `bun-test-setup.ts` via `bunfig.toml`.  
**E2E (Playwright)**: Tests in `e2e/journeys/*.spec.ts`, needs build+preview on port 4173, retries 3x, timeout 120s,
Chromium only.

## Common Pitfalls

1. **Blank page in dev**: Disable ad blockers if seeing "Failed to fetch dynamically imported module" (known SvelteKit
   issue)
2. **Network errors on install**:
    - pkg.pr.new/pkg.vc deps may fail due to firewall/proxy restrictions
    - Check access: `curl -I https://pkg.pr.new` and `curl -I https://pkg.vc`
    - Configure proxy if needed: `npm config set proxy http://proxy:port` and
      `npm config set https-proxy http://proxy:port`
    - GitHub Actions: Ensure runner has internet access and Bun is installed
    - Local dev: Often safe to continue with cached versions if network fails
3. **OOM on build**: Set `NODE_OPTIONS=--max_old_space_size=8192` (like Dockerfile does)
4. **Test failures**: Always use `bun run test` (sets TZ=EST), not `bun test` directly
5. **TS errors not showing**: Run `bun run check` explicitly (dev server doesn't always surface them)
6. **Format vs lint conflicts**: Run `bun run format` before `bun run lint`
7. **E2E timeouts**: Wait 120s for preview server startup, tests auto-retry 3x
8. **Stale build**: Clear `.svelte-kit` if changes not reflected: `rm -rf .svelte-kit && bun run build`

## Code Conventions

- Imports: Use `$lib`, `$routes`, `$themes` aliases
- Components: PascalCase, in `src/lib/components/[feature]/`
- Helpers: Pure functions in `src/lib/helpers/`
- Types: Inline or `.d.ts`, not `.types.ts` files
- Comments: Minimal, use for TODOs or complex logic
- TypeScript: Not strict mode, `any` tolerated

## Workflow

1. Run Appwrite backend locally (see [docs](https://appwrite.io/docs/advanced/self-hosting))
2. Configure `.env` with backend endpoint
3. `bun install --frozen-lockfile`
4. `bun run dev` (hot reload on port 3000)
5. Before commit: `bun run check && bun run format && bun run lint && bun run test && bun run build`
6. **Take screenshots**: For any UI changes, capture screenshots and include them in the PR description or comments
   before finalizing

## Required Pre-Completion Checklist

**CRITICAL**: Before finishing any work or marking a task complete, agents MUST run the following commands in order and
ensure all pass:

1. **`bun run format`** - Auto-fix all formatting issues
2. **`bun run check`** - Verify TypeScript/Svelte types (must show 0 errors, 0 warnings)
3. **`bun run lint`** - Check code style (ignore pre-existing issues in files you didn't modify)
4. **`bun run test`** - Run all unit tests (all tests must pass)
5. **`bun run build`** - Ensure production build succeeds

If any command fails:

- **Format/Lint**: Run `bun run format` to auto-fix, then re-check
- **Type errors**: Fix all TypeScript errors in files you modified
- **Test failures**: Fix failing tests or ensure failures are unrelated to your changes
- **Build failures**: Debug and resolve build issues before proceeding

**Never skip these checks** - they are mandatory quality gates before any work is considered complete.

**Trust these instructions** - only search if incomplete/incorrect. See CONTRIBUTING.md for PR conventions. Use
`--frozen-lockfile` always. Docker builds: multi-stage, final image is nginx serving static files from `/console` path.
