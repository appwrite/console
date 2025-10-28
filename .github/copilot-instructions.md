# Appwrite Console - Copilot Instructions

## Repository Overview

Appwrite Console is the web-based GUI for the Appwrite backend-as-a-service platform. Single-page application built with **Svelte 5 + SvelteKit 2**, **TypeScript** (not strict mode), **Vite 7**, tested with **Vitest + Playwright**. Package manager: **pnpm 10.15.1**, Node 20+. ~1500 files with extensive component-based architecture.

## Critical Build & Test Commands

### Setup (REQUIRED before any commands)

1. **Install pnpm**: `npm install -g corepack && corepack enable && corepack prepare pnpm@10.15.1 --activate`
2. **Create .env**: `cp .env.example .env` (configure `PUBLIC_APPWRITE_ENDPOINT` and `PUBLIC_CONSOLE_MODE`)
3. **Install dependencies**: `pnpm install --frozen-lockfile`

### GitHub Actions Setup

When running in GitHub Actions, ensure network access to required package registries:

**Required domains** (add to firewall allowlist):
- `pkg.pr.new` - Required for `@appwrite.io/console` dependency
- `pkg.vc` - Required for `@appwrite.io/pink-icons-svelte` and `@appwrite.io/pink-svelte` dependencies
- `registry.npmjs.org` - Standard npm registry

**Action configuration**:
```yaml
- name: Install pnpm
  uses: pnpm/action-setup@v4
```

The `pnpm/action-setup@v4` action handles registry configuration automatically. If installation fails with ENOTFOUND errors for pkg.pr.new or pkg.vc, verify runner has internet access and these domains are not blocked by firewall/proxy.

### Development Commands

**Standard workflow**: `check` → `lint` → `test` → `build` (before committing)

- `pnpm run check` - TypeScript/Svelte validation (~30-60s)
- `pnpm run lint` - ESLint check (~10-20s)
- `pnpm run format` - Auto-fix Prettier formatting
- `pnpm run test` - Vitest unit tests with TZ=EST (~10-30s)
- `pnpm run build` - Production build via build.js (~60-120s)
- `pnpm dev` - Dev server on port 3000
- `pnpm run preview` - Preview build on port 4173
- `pnpm run e2e` - Playwright tests (needs `pnpm exec playwright install --with-deps chromium` first, ~120s+)

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

**SvelteKit conventions**: `+page.svelte` (component), `+page.ts` (data loader), `+layout.svelte` (wrapper), `+error.svelte` (errors). Groups like `(console)` organize routes without affecting URLs. Dynamic params: `[param]`.

## Key Configuration

**svelte.config.js**: Adapter = static SPA (fallback: index.html), base path `/console`, aliases: `$lib`, `$routes`, `$themes`  
**vite.config.ts**: Dev port 3000, Vitest (client=jsdom, server=node), test files: `src/**/*.{test,spec}.{js,ts}`  
**tsconfig.json**: Extends `.svelte-kit/tsconfig.json`, **NOT strict mode** (`strict: false`)  
**eslint.config.js**: Flat config (ESLint 9+), many rules disabled (see TODOs)  
**.prettierrc**: 4 spaces, single quotes, 100 char width, no trailing commas

## Testing

**Unit (Vitest)**: Tests in `src/lib/helpers/*.test.ts`, run with `TZ=EST` (timezone matters). Setup mocks SvelteKit (`$app/*`) in `vitest-setup-client.ts`.  
**E2E (Playwright)**: Tests in `e2e/journeys/*.spec.ts`, needs build+preview on port 4173, retries 3x, timeout 120s, Chromium only.

## Common Pitfalls

1. **Blank page in dev**: Disable ad blockers if seeing "Failed to fetch dynamically imported module" (known SvelteKit issue)
2. **Network errors on install**: 
   - pkg.pr.new/pkg.vc deps may fail due to firewall/proxy restrictions
   - Check access: `curl -I https://pkg.pr.new` and `curl -I https://pkg.vc`
   - Configure proxy if needed: `npm config set proxy http://proxy:port` and `npm config set https-proxy http://proxy:port`
   - Local dev: Installation may still succeed with cached versions if network fails
3. **OOM on build**: Set `NODE_OPTIONS=--max_old_space_size=8192` (like Dockerfile does)
4. **Test failures**: Always use `pnpm run test` (sets TZ=EST), not `vitest` directly
5. **TS errors not showing**: Run `pnpm run check` explicitly (dev server doesn't always surface them)
6. **Format vs lint conflicts**: Run `pnpm run format` before `pnpm run lint`
7. **E2E timeouts**: Wait 120s for preview server startup, tests auto-retry 3x
8. **Stale build**: Clear `.svelte-kit` if changes not reflected: `rm -rf .svelte-kit && pnpm run build`

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
3. `pnpm install --frozen-lockfile`
4. `pnpm dev` (hot reload on port 3000)
5. Before commit: `pnpm run check && pnpm run format && pnpm run lint && pnpm run test && pnpm run build`

**Trust these instructions** - only search if incomplete/incorrect. See CONTRIBUTING.md for PR conventions. Use `--frozen-lockfile` always. Docker builds: multi-stage, final image is nginx serving static files from `/console` path.
