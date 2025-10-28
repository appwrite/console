# Appwrite Console - Copilot Instructions

## Repository Overview

**What it is**: Appwrite Console is the web-based Graphical User Interface for developers to interact with their Appwrite instance. It's a production-ready single-page application serving as the front-end dashboard for the Appwrite backend-as-a-service platform.

**Tech Stack**:
- Framework: Svelte 5 + SvelteKit 2
- Language: TypeScript (not strictly typed - `strict: false` in tsconfig)
- Build Tool: Vite 7
- Package Manager: pnpm 10.15.1
- Node Version: 20+
- Testing: Vitest (unit) + Playwright (e2e)
- UI Components: Custom design system (@appwrite.io/pink-svelte, @appwrite.io/pink-icons-svelte)
- Styling: SCSS with svelte-preprocess

**Size**: ~1500 files, heavily component-based architecture with extensive routing.

## Critical Build & Test Commands

### Prerequisites
**ALWAYS** install pnpm first before any other commands:
```bash
npm install -g corepack
corepack enable
corepack prepare pnpm@10.15.1 --activate
```

### Environment Setup
**REQUIRED** before dev or build: Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Key environment variables (see `.env.example`):
- `PUBLIC_CONSOLE_MODE`: `self-hosted` or `cloud`
- `PUBLIC_APPWRITE_ENDPOINT`: Backend API endpoint (default: `http://localhost/v1`)
- `PUBLIC_APPWRITE_MULTI_REGION`: `true` or `false`
- `PUBLIC_CONSOLE_EMAIL_VERIFICATION`: `true` or `false`
- `PUBLIC_CONSOLE_MOCK_AI_SUGGESTIONS`: `true` or `false`

### Installation
**ALWAYS** use `--frozen-lockfile` for reproducible builds:
```bash
pnpm install --frozen-lockfile
```

**Note**: Some dependencies may fail to download due to network issues (e.g., pkg.pr.new, pkg.vc domains). The build may still succeed if these are optional development dependencies.

### Commands (in order of typical workflow)

1. **Install dependencies**: `pnpm install --frozen-lockfile` (required first)
2. **Check TypeScript/Svelte**: `pnpm run check` (~30-60 seconds)
3. **Lint**: `pnpm run lint` (~10-20 seconds)
4. **Format**: `pnpm run format` (auto-fixes formatting issues)
5. **Unit Tests**: `pnpm run test` (runs Vitest with TZ=EST, ~10-30 seconds)
6. **Build**: `pnpm run build` (runs custom build.js script, ~60-120 seconds)
7. **Dev Server**: `pnpm dev` (starts Vite dev server on port 3000)
8. **Preview**: `pnpm run preview` (preview production build on port 4173)
9. **E2E Tests**: `pnpm run e2e` (requires build + preview, ~120+ seconds)

### CI/CD Pipeline Validation

**GitHub Actions run on every PR** (see `.github/workflows/tests.yml`):
1. `pnpm audit --audit-level high` (security check)
2. `pnpm install --frozen-lockfile`
3. `pnpm run check` (Svelte diagnostics)
4. `pnpm run lint`
5. `pnpm run test` (unit tests)
6. `pnpm run build`

**To replicate CI locally**, run these commands in sequence:
```bash
pnpm audit --audit-level high
pnpm install --frozen-lockfile
pnpm run check
pnpm run lint
pnpm run test
pnpm run build
```

**E2E Tests** (separate workflow `.github/workflows/e2e.yml`):
```bash
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
pnpm run e2e
```

## Project Architecture

### Directory Structure
```
├── src/
│   ├── lib/                      # Reusable logic (import as '$lib')
│   │   ├── actions/              # Svelte actions
│   │   ├── charts/               # Chart components (ECharts)
│   │   ├── commandCenter/        # Command palette functionality
│   │   ├── components/           # Reusable UI components
│   │   │   ├── billing/          # Billing-related components
│   │   │   ├── domains/          # Domain management
│   │   │   ├── feedback/         # User feedback system
│   │   │   ├── filters/          # Data filtering
│   │   │   ├── permissions/      # Permission management
│   │   │   └── ...               # Many other feature areas
│   │   ├── elements/             # Basic UI elements
│   │   ├── helpers/              # Utility functions
│   │   ├── images/               # Image assets
│   │   ├── layout/               # Global layout components (Nav, Container)
│   │   ├── mock/                 # Mock components for testing
│   │   ├── sdk/                  # Appwrite SDK wrappers
│   │   ├── stores/               # Svelte stores (state management)
│   │   ├── constants.ts          # Global constants
│   │   ├── flags.ts              # Feature flags
│   │   └── system.ts             # System utilities
│   ├── routes/                   # SvelteKit file-based routing
│   │   ├── (console)/            # Authenticated routes
│   │   │   ├── organization-[organization]/  # Org-scoped routes
│   │   │   ├── project-[region]-[project]/   # Project-scoped routes
│   │   │   │   ├── databases/    # Database service
│   │   │   │   ├── functions/    # Functions service
│   │   │   │   ├── messaging/    # Messaging service
│   │   │   │   ├── storage/      # Storage service
│   │   │   │   └── ...           # Other services
│   │   │   ├── onboarding/       # User onboarding flows
│   │   │   └── wizard/           # Setup wizards
│   │   └── (public)/             # Unauthenticated routes
│   │       ├── (guest)/          # Login, register, etc.
│   │       └── auth/             # OAuth callbacks
│   ├── themes/                   # Theme definitions (import as '$themes')
│   ├── app.html                  # HTML template
│   ├── hooks.client.ts           # Client hooks
│   ├── hooks.server.ts           # Server hooks
│   └── service-worker.ts         # Service worker
├── static/                       # Static assets (served as-is)
├── e2e/                          # Playwright e2e tests
│   ├── helpers/                  # Test helpers
│   ├── steps/                    # Test steps
│   └── journeys/                 # Test scenarios (*.spec.ts)
├── docker/                       # Docker configuration
│   └── nginx.conf                # Nginx config for production
├── .github/workflows/            # GitHub Actions
│   ├── tests.yml                 # Unit tests + build
│   ├── e2e.yml                   # E2E tests
│   ├── publish.yml               # Docker image publishing
│   └── stale.yml                 # Stale issue management
├── build.js                      # Custom build script (wraps Vite)
├── vite.config.ts                # Vite configuration
├── svelte.config.js              # Svelte/SvelteKit configuration
├── tsconfig.json                 # TypeScript configuration
├── eslint.config.js              # ESLint configuration (flat config)
├── .prettierrc                   # Prettier configuration
├── playwright.config.ts          # Playwright configuration
└── Dockerfile                    # Multi-stage Docker build
```

### SvelteKit Routing Conventions
- `+page.svelte`: Page component
- `+page.ts`: Page data loader (runs before component)
- `+layout.svelte`: Layout wrapper for nested routes
- `+layout.ts`: Layout data loader
- `+error.svelte`: Error boundary
- `(console)/`: Route group (doesn't affect URL, used for organization)
- `[param]/`: Dynamic route parameter

### Key Configuration Files

**svelte.config.js**:
- Adapter: `@sveltejs/adapter-static` (SPA mode with fallback to index.html)
- Base path: `/console` (unless PREVIEW env var set)
- Aliases: `$routes` → `./src/routes`, `$themes` → `./src/themes`
- Preprocessors: SCSS + Melt UI

**vite.config.ts**:
- Dev server port: 3000
- Vitest configured with two projects: "client" (jsdom) and "server" (node)
- Client tests: `src/**/*.svelte.{test,spec}.{js,ts}`
- Server tests: `src/**/*.{test,spec}.{js,ts}` (excluding `.svelte.` files)
- SSR noExternal: analytics, dayjs, echarts, prismjs, zrender

**tsconfig.json**:
- Extends `.svelte-kit/tsconfig.json` (auto-generated)
- **NOT strict**: `strict: false`
- Unused locals/parameters flagged: `noUnusedLocals: true`, `noUnusedParameters: true`

**eslint.config.js**:
- Flat config format (ESLint 9+)
- Many rules temporarily disabled (see TODOs in file)
- Svelte plugin configured with parser for `.svelte` files

**.prettierrc**:
- 4 spaces (not tabs)
- Single quotes
- No trailing commas
- 100 char line width
- Bracket same line

### Testing

**Unit Tests (Vitest)**:
- Setup: `vitest-setup-client.ts` mocks SvelteKit modules
- Location: `src/lib/helpers/*.test.ts`, `src/routes/**/store.test.ts`
- Run with: `TZ=EST vitest run` (timezone matters for date tests)
- Environment: jsdom for client tests, node for server tests

**E2E Tests (Playwright)**:
- Location: `e2e/journeys/*.spec.ts`
- Requires: Build + preview server running on port 4173
- Browser: Chromium only (install with `pnpm exec playwright install --with-deps chromium`)
- Retries: 3 (configured in playwright.config.ts)
- Timeout: 120 seconds per test

## Common Pitfalls & Workarounds

1. **Blank page after `pnpm dev`**: If browser console shows `TypeError: Failed to fetch dynamically imported module`, disable ad blockers and reload. This is a known SvelteKit issue.

2. **Network errors during install**: Dependencies from `pkg.pr.new` and `pkg.vc` may fail due to network restrictions. These are often optional; continue if other dependencies install successfully.

3. **Build fails with memory error**: The Dockerfile sets `NODE_OPTIONS=--max_old_space_size=8192`. If building locally fails with OOM, set this environment variable.

4. **Tests fail with timezone issues**: Unit tests run with `TZ=EST`. Always use `pnpm run test` instead of `vitest` directly.

5. **TypeScript errors not showing**: Run `pnpm run check` explicitly. The dev server doesn't always surface TS errors.

6. **Linter vs formatter conflicts**: Run `pnpm run format` before `pnpm run lint`. Prettier formats, then ESLint checks logic.

7. **E2E tests timeout**: Ensure preview server is fully started (wait 120s). Tests retry 3 times automatically.

8. **Changes not reflected in build**: Clear `.svelte-kit` directory: `rm -rf .svelte-kit && pnpm run build`

## Code Style & Conventions

- **Imports**: Use `$lib` alias for `src/lib`, `$routes` for `src/routes`, `$themes` for `src/themes`
- **Components**: PascalCase filenames, organized by feature in `src/lib/components/[feature]/`
- **Stores**: Svelte stores in `src/lib/stores/`, use derived stores for computed values
- **Helpers**: Pure utility functions in `src/lib/helpers/`
- **Types**: Inline types or in `.d.ts` files, not in separate `.types.ts` files
- **Comments**: Minimal; use for TODOs (`// TODO:`) or complex logic only
- **No strict TypeScript**: Many `any` types tolerated, focus on functionality over perfect typing

## Development Workflow

1. **Start backend**: Run Appwrite locally (see [docs](https://appwrite.io/docs/advanced/self-hosting))
2. **Configure environment**: Ensure `.env` points to backend endpoint
3. **Install**: `pnpm install --frozen-lockfile`
4. **Develop**: `pnpm dev` (hot reload enabled)
5. **Check types**: `pnpm run check` (frequently, especially before committing)
6. **Format**: `pnpm run format` (before committing)
7. **Test**: `pnpm run test` (unit tests)
8. **Build**: `pnpm run build` (validate production build)
9. **E2E** (optional): `pnpm run e2e` (if touching critical flows)

## Security & Dependencies

- **Audit on every PR**: `pnpm audit --audit-level high` runs in CI
- **Frozen lockfile**: Always use `--frozen-lockfile` to prevent supply chain attacks
- **Update dependencies carefully**: Discuss with team before adding/updating (see CONTRIBUTING.md)
- **Sentry**: Integrated for error tracking (requires `SENTRY_AUTH_TOKEN` for production builds)

## Final Notes

- **Trust these instructions**: Only search/explore if information is incomplete or incorrect
- **Read CONTRIBUTING.md**: Required reading for contribution guidelines and PR conventions
- **Check feature flags**: Some features gated by `PUBLIC_CONSOLE_FEATURE_FLAGS` env var
- **Backend dependency**: Console requires Appwrite backend running; mock mode available with `PUBLIC_CONSOLE_MOCK_AI_SUGGESTIONS=true`
- **Docker builds**: Use multi-stage build in Dockerfile; final image is nginx serving static files
- **Path configuration**: All routes prefixed with `/console` in production (see svelte.config.js)
