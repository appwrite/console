# Appwrite Console

SvelteKit web dashboard for Appwrite. Manages projects, databases, functions, auth, storage, messaging, and sites. Static SPA (no SSR) served behind Nginx at `/console`.

## Commands

All commands use **bun** (not pnpm/npm).

| Command | Purpose |
|---------|---------|
| `bun dev` | Dev server (port 3000) |
| `bun run build` | Production build (custom `build.js` via Vite) |
| `bun check` | `svelte-kit sync && svelte-check` |
| `bun format` | Prettier write + cache |
| `bun run lint` | Prettier check + ESLint |
| `bun tests` | Unit + E2E |
| `bun test:unit` | Vitest (TZ=EST) |
| `bun test:unit-watch` | Vitest watch mode |
| `bun test:e2e` | Playwright |
| `bun run clean` | Remove node_modules, .svelte-kit, reinstall |

**Always run `bun format` before committing.**

## CI checks (`.github/workflows/tests.yml`)

Runs on PRs: `bun audit` -> `bun check` -> `bun run lint` -> `bun test:unit` -> `bun run build`. Uses frozen lockfile.

## Stack

- **Framework:** SvelteKit 2 + **Svelte 5** (runes), TypeScript, `@sveltejs/adapter-static`
- **Bundler:** Vite 7 (overridden to `rolldown-vite`)
- **Design system:** `@appwrite.io/pink-svelte`, `@appwrite.io/pink-icons-svelte`
- **UI primitives:** Melt UI (`@melt-ui/svelte` with preprocessor)
- **API client:** `@appwrite.io/console` SDK (pinned to GitHub commit)
- **Code editing:** CodeMirror 6
- **Charts:** ECharts 5
- **3D:** Three.js via Threlte
- **Payments:** Stripe
- **AI:** Vercel AI SDK (`@ai-sdk/svelte`)
- **Testing:** Vitest + @testing-library/svelte (unit), Playwright (E2E)
- **Error tracking:** Sentry (`@sentry/sveltekit`)
- **Analytics:** Plausible + custom Growth endpoint

## Architecture

### Route structure (`src/routes/`)

SvelteKit file-based routing with layout groups:
- `(public)/` — login, register, auth callbacks, invite, recover
- `(console)/` — authenticated console (projects, orgs, account)
- `(authenticated)/` — auth-related flows (MFA, Git integration)

Dynamic segments: `project-[region]-[project]`, `organization-[organization]`

### Route file conventions

Each route can have:
- `+page.svelte` — page component
- `+page.ts` — client-side load function
- `+layout.svelte` / `+layout.ts` — layout wrappers
- `store.ts` — route-scoped state
- Feature components colocated alongside (e.g. `table.svelte`, `create.svelte`)

### Path aliases

| Alias | Path |
|-------|------|
| `$lib` | `src/lib` (SvelteKit built-in) |
| `$routes` | `src/routes` |
| `$themes` | `src/themes` |
| `$database` | `src/routes/(console)/project-[region]-[project]/databases/database-[database]` |

### Library (`src/lib/`)

| Directory | Contents |
|-----------|----------|
| `components/` | Feature components (billing, permissions, filters, etc.) — barrel-exported via `index.ts` |
| `elements/forms/` | Form inputs (text, email, phone, OTP, file, geometry, etc.) |
| `elements/table/` | Table components |
| `layout/` | Shell, Container, Wizard, Breadcrumbs, Navigation — barrel-exported via `index.ts` |
| `stores/` | Svelte stores for global state |
| `helpers/` | Utilities (array, date, object, numbers, string, validation) |
| `sdk/` | Custom SDK extensions (billing, usage, sources) |
| `actions/` | Svelte actions and analytics tracking |
| `charts/` | Chart visualization components — barrel-exported via `index.ts` |
| `commandCenter/` | Command palette |
| `profiles/` | CSS profiles and theming |
| `mock/` | Mock data for development |

### Imports

Components use **barrel exports** — always import from the directory `index.ts`:
```typescript
import { Card, Modal, Steps } from '$lib/components';
import { Shell, Container } from '$lib/layout';
```

### Svelte 5 migration (in progress)

The codebase is migrating from Svelte 4 to Svelte 5 runes. Most files (~500) still use legacy `export let` and `$:` syntax. ~240 files have been migrated to runes. **When touching a file, migrate it to runes if practical.** Don't mix syntaxes within a single component.

Legacy (Svelte 4):
```svelte
<script lang="ts">
    export let items: Item[] = [];
    export let disabled = false;
    $: count = items.length;
</script>
```

Runes (Svelte 5 — preferred for new and modified code):
```svelte
<script lang="ts">
    let { items = $bindable(), disabled = false }: Props = $props();
    let selected = $state<string | null>(null);
    const count = $derived(items.length);
    const filtered = $derived.by(() => items.filter(i => i.active));

    $effect(() => {
        console.log('selected changed:', selected);
    });
</script>
```

### SDK usage (`src/lib/stores/sdk.ts`)

Three client instances: `clientConsole` (console API), `clientProject` (project API, admin mode), `clientRealtime` (realtime subscriptions). Region-aware endpoints with subdomain routing (fra., nyc., syd., sfo., sgp., tor.).

```typescript
import { sdk } from '$lib/stores/sdk';

// Console-level operations
await sdk.forConsole.account.get();

// Region-scoped console operations
await sdk.forConsoleIn(region).projects.get({ projectId });

// Project-level operations (admin mode)
await sdk.forProject(region, projectId).tablesDB.listTables();
```

**Console SDK services:** Account, Avatars, Functions, Health, Locale, Projects, Teams, Users, Migrations, Console, Assistant, Sources, Sites, Domains, Storage, Realtime, Organizations

**Project SDK services:** Account, Avatars, Backups, Functions, Health, Locale, Messaging, Project, Storage, Tokens, Teams, Users, VCS, Proxy, Migrations, Sites, TablesDB, DocumentsDB, Compute, VectorsDB, Webhooks, Console

### Database types (feat-dedicated-db)

The databases feature unifies four database backends behind a polymorph API (`$database/(entity)/helpers/sdk.ts`):

| Type | Entity | Field | Record | Index types |
|------|--------|-------|--------|-------------|
| `tablesdb` | table | column | row | `TablesDBIndexType` |
| `documentsdb` | collection | attribute | document | `DocumentsDBIndexType` |
| `vectorsdb` | collection | attribute | document | `VectorsDBIndexType` |
| `dedicateddb` | table | column | row | managed externally |

- `useDatabaseSdk()` returns a unified interface regardless of backing type
- `useTerminology()` returns singular/plural names for the current database type
- DedicatedDB uses the `Compute` service (not Appwrite schema APIs) — creates always-on PostgreSQL/MySQL instances via `compute.createDatabase()` with `Backend.Edge`
- `DatabaseType` union: `'legacy' | 'tablesdb' | 'documentsdb' | 'vectorsdb' | 'dedicateddb'`

### Data loading

Load functions declare dependencies for cache invalidation via `depends()`:
```typescript
export const load: LayoutLoad = async ({ depends, parent, params }) => {
    depends(Dependencies.DATABASE);
    return { database: await sdk.forProject(...).tablesDB.get(...) };
};
```
Invalidate with `await invalidate(Dependencies.DATABASE)` after mutations. Dependency keys are defined in `src/lib/constants.ts` as the `Dependencies` enum.

### State management

Stores in `src/lib/stores/` — writable, derived, and "conservative" (selective update via `createConservative()` from `$lib/helpers/stores`) patterns. Key stores: `app`, `user`, `organization`, `projects`, `billing`, `wizard`, `notifications`, `sdk`. Stores often derive from SvelteKit's `page` store for route-aware state.

### Wizard pattern (`$lib/stores/wizard`)

Modal wizard flow: `wizard.start(Component, media?, step?, props?)` to open, `wizard.hide()` to close. Supports `setInterceptor()` for async pre-step validation, `finalAction()` for completion, and `setNextDisabled()` for flow control.

### Notifications (`$lib/stores/notifications`)

```typescript
import { addNotification } from '$lib/stores/notifications';
addNotification({ type: 'error', message: error.message });
```
Types: `'success' | 'error' | 'info' | 'warning'`. Auto-dismisses after 6s by default. Max 5 visible.

### Analytics (`$lib/actions/analytics`)

Plausible + custom Growth endpoint. Track events via `trackEvent(Click.* | Submit.*, data)` and errors via `trackError(exception, Submit.*)`. Respects `navigator.doNotTrack`.

### Theming

Four theme variants in `src/themes/`: `light`, `dark`, `light-cloud`, `dark-cloud`. Resolved based on `isCloud` flag and user preference.

### Modes (`src/lib/system.ts`)

Two modes: `cloud` and `self-hosted`, set via `PUBLIC_CONSOLE_MODE` env var. Gate cloud-only features with `isCloud`.

## Code style

- **Formatter:** Prettier — 4 spaces, single quotes, no trailing commas, 100 char width, bracket same line
- **Prefer Svelte 5 runes** in new and modified code (`$props()`, `$state()`, `$derived()`, `$effect()`). Migrate legacy syntax when touching a file.
- Types from `@appwrite.io/console` SDK (`Models`, `Query`, enums) — don't redefine what the SDK provides
- Error handling: try/catch with `addNotification()` for user-facing errors, `trackError()` for analytics
- Queries use the SDK's `Query` builder: `Query.equal()`, `Query.limit()`, `Query.offset()`, etc.
- Mark tech debt with `@todo` annotations, never `@fixme`
- Don't add new dependencies without consulting the team

## Environment variables

Set via `.env` (copy `.env.example`). All prefixed with `PUBLIC_` for SvelteKit:

| Variable | Default | Purpose |
|----------|---------|---------|
| `PUBLIC_CONSOLE_MODE` | `self-hosted` | `cloud` or `self-hosted` |
| `PUBLIC_APPWRITE_ENDPOINT` | `http://localhost/v1` | API endpoint |
| `PUBLIC_APPWRITE_MULTI_REGION` | `false` | Multi-region support |
| `PUBLIC_STRIPE_KEY` | — | Stripe public key (cloud only) |
| `PUBLIC_GROWTH_ENDPOINT` | — | Analytics endpoint |
| `PUBLIC_CONSOLE_FEATURE_FLAGS` | — | Feature flags |
| `PUBLIC_CONSOLE_EMAIL_VERIFICATION` | `false` | Require email verification |
| `PUBLIC_CONSOLE_MOCK_AI_SUGGESTIONS` | `true` | Mock AI in dev |

## Branch naming

`TYPE-ISSUE_ID-DESCRIPTION` (e.g. `feat-548-add-backup-ui`). Types: feat, fix, doc, cicd, refactor.

## Cross-repo context

The `feat-dedicated-db` feature spans cloud, edge, and console. When modifying API contracts or response models, check the other repos for breaking changes.
