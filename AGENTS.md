# Appwrite Console

SvelteKit web dashboard for Appwrite. Manages projects, databases, functions, auth, storage, messaging, and sites. Static SPA (no SSR) served behind Nginx at `/console`.

## Commands

All commands use **bun** (not pnpm/npm). Use `bun run <script>` consistently — `bun run build` is required to avoid invoking bun's built-in bundler.

| Command                   | Purpose                                       |
| ------------------------- | --------------------------------------------- |
| `bun run dev`             | Dev server (port 3000)                        |
| `bun run build`           | Production build (custom `build.js` via Vite) |
| `bun run check`           | `svelte-kit sync && svelte-check`             |
| `bun run format`          | Prettier write + cache                        |
| `bun run lint`            | Prettier check + ESLint                       |
| `bun run tests`           | Unit + E2E                                    |
| `bun run test:unit`       | Vitest (TZ=EST)                               |
| `bun run test:unit-watch` | Vitest watch mode                             |
| `bun run test:e2e`        | Playwright                                    |
| `bun run clean`           | Remove node_modules, .svelte-kit, reinstall   |

**Always run before committing:** `bun run format && bun run check && bun run lint && bun run tests && bun run build`

## CI checks (`.github/workflows/tests.yml`)

`bun audit --audit-level high` -> `bun check` -> `bun lint` -> `bun test:unit` -> `bun run build`. Uses frozen lockfile.

## Stack

- **Framework:** SvelteKit 2 + Svelte 5, TypeScript (strict: false), `@sveltejs/adapter-static`
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

- `(public)/` -- unauthenticated routes: `(guest)/` (login, register), auth (OAuth, magic URL), invite, recover, card, functions/sites deploy, hackathon, templates
- `(console)/` -- authenticated console (projects, orgs, account, onboarding)
- `(authenticated)/` -- post-login flows (MFA, Git authorization)

Dynamic segments: `project-[region]-[project]`, `organization-[organization]`

### Route file conventions

Each route can have:

- `+page.svelte` -- page component
- `+page.ts` -- client-side load function
- `+layout.svelte` / `+layout.ts` -- layout wrappers
- `store.ts` -- route-scoped state
- Feature components colocated alongside (e.g. `table.svelte`, `create.svelte`)

### Path aliases

| Alias       | Path                                                                            |
| ----------- | ------------------------------------------------------------------------------- |
| `$lib`      | `src/lib` (SvelteKit built-in)                                                  |
| `$routes`   | `src/routes`                                                                    |
| `$themes`   | `src/themes`                                                                    |
| `$database` | `src/routes/(console)/project-[region]-[project]/databases/database-[database]` |

### Library (`src/lib/`)

| Directory         | Contents                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------ |
| `components/`     | Feature components (billing, permissions, filters, etc.) -- barrel-exported via `index.ts` |
| `elements/forms/` | Form inputs (text, email, phone, OTP, file, geometry, etc.)                                |
| `elements/table/` | Table components                                                                           |
| `layout/`         | Shell, Container, Wizard, Breadcrumbs, Navigation -- barrel-exported via `index.ts`        |
| `stores/`         | Svelte stores for global state                                                             |
| `helpers/`        | Utilities (array, date, object, numbers, string, validation)                               |
| `sdk/`            | Custom SDK extensions (billing, usage, sources)                                            |
| `actions/`        | Svelte actions and analytics tracking                                                      |
| `charts/`         | Chart visualization components -- barrel-exported via `index.ts`                           |
| `commandCenter/`  | Command palette                                                                            |
| `images/`         | SVG assets (logos, illustrations, empty states)                                            |
| `data/`           | Static data (testimonials)                                                                 |
| `profiles/`       | CSS profiles and theming                                                                   |
| `mock/`           | Mock data for development                                                                  |

### Imports

Components use **barrel exports** -- always import from the directory `index.ts`:

```typescript
import { Card, Modal, Steps } from '$lib/components';
import { Shell, Container } from '$lib/layout';
import { InputText, Button, Form } from '$lib/elements/forms';
```

### Svelte 5 migration (in progress)

~500 files still use legacy Svelte 4 syntax, ~240 migrated to runes. **When touching a file, migrate it to runes if practical.** Don't mix syntaxes within a single component.

Legacy (Svelte 4):

```svelte
<script lang="ts">
    export let items: Item[] = [];
    export let disabled = false;
    $: count = items.length;
</script>
```

Runes (Svelte 5 -- preferred for new and modified code):

```svelte
<script lang="ts">
    // $bindable() enables two-way binding so parent components can mutate items directly
    let { items = $bindable(), disabled = false }: Props = $props();
    let selected = $state<string | null>(null);
    const count = $derived(items.length);
    const filtered = $derived.by(() => items.filter((i) => i.active));

    $effect(() => {
        console.log('selected changed:', selected);
    });
</script>
```

### SDK usage (`src/lib/stores/sdk.ts`)

Four client instances: `clientConsole` (console API), `scopedConsoleClient` (region-scoped console API, used by `forConsoleIn()`), `clientProject` (project API, admin mode), `clientRealtime` (realtime subscriptions). Region-aware endpoints with subdomain routing (fra., nyc., syd., sfo., sgp., tor.).

```typescript
import { sdk } from '$lib/stores/sdk';

// Console-level operations
await sdk.forConsole.account.get();

// Region-scoped console operations
await sdk.forConsoleIn(region).projects.get({ projectId });

// Project-level operations (admin mode)
await sdk.forProject(region, projectId).tablesDB.listTables();
```

### Database types (feat-dedicated-db)

The databases feature unifies multiple database backends behind a polymorph API (`$database/(entity)/helpers/sdk.ts`):

| Type          | Entity     | Field     | Record   | Status                  |
| ------------- | ---------- | --------- | -------- | ----------------------- |
| `tablesdb`    | table      | column    | row      | Implemented             |
| `documentsdb` | collection | attribute | document | Implemented             |
| `vectorsdb`   | --         | --        | --       | Not yet implemented     |
| `dedicateddb` | table      | column    | row      | Cross-repo (cloud/edge) |

- `useDatabaseSdk()` returns a unified interface regardless of backing type
- `useTerminology()` returns singular/plural names for the current database type

### Data loading

Load functions declare dependencies for cache invalidation via `depends()`:

```typescript
export const load: LayoutLoad = async ({ depends, parent, params }) => {
    depends(Dependencies.DATABASE);
    return { database: await sdk.forProject(...).tablesDB.get(...) };
};
```

Invalidate with `await invalidate(Dependencies.DATABASE)` after mutations. The `Dependencies` enum in `src/lib/constants.ts` defines 66+ keys for fine-grained cache invalidation (e.g. `DATABASES`, `TABLES`, `FUNCTIONS`, `USERS`, `DEPLOYMENTS`).

### State management

Stores in `src/lib/stores/` -- writable, derived, and "conservative" (selective update via `createConservative()` from `$lib/helpers/stores`) patterns. Key stores: `app`, `user`, `organization`, `projects`, `billing`, `wizard`, `notifications`, `sdk`.

### Wizard pattern (`$lib/stores/wizard`)

Modal wizard flow: `wizard.start(Component, media?, step?, props?)` to open, `wizard.hide()` to close. Methods: `setInterceptor(callback)` for async pre-step validation, `setNextDisabled(bool)` for flow control, `setStep(n)` / `updateStep(cb)` for navigation, `showCover(Component)` for overlays.

### Notifications (`$lib/stores/notifications`)

```typescript
import { addNotification } from '$lib/stores/notifications';
addNotification({ type: 'error', message: error.message });
```

Types: `'success' | 'error' | 'info' | 'warning'`. Auto-dismisses after 6s. Max 5 visible.

### Analytics (`$lib/actions/analytics`)

Plausible + custom Growth endpoint. Track events via `trackEvent(Click.* | Submit.*, data)` and errors via `trackError(exception, Submit.*)`. Respects `navigator.doNotTrack`.

### Theming and modes

Four theme variants in `src/themes/`: `light`, `dark`, `light-cloud`, `dark-cloud`. Resolved based on `isCloud` flag and user preference. Two modes (`src/lib/system.ts`): `cloud` and `self-hosted`, set via `PUBLIC_CONSOLE_MODE` env var. Gate features using `isCloud` (for cloud-only) or `isSelfHosted` (for self-hosted-only).

## Code style

- **Formatter:** Prettier -- 4 spaces, single quotes, no trailing commas, 100 char width, bracket same line
- **Prefer Svelte 5 runes** in new and modified code (`$props()`, `$state()`, `$derived()`, `$effect()`)
- Types from `@appwrite.io/console` SDK (`Models`, `Query`, enums) -- don't redefine what the SDK provides
- Error handling: try/catch with `addNotification()` for user-facing errors, `trackError()` for analytics
- Queries use the SDK's `Query` builder: `Query.equal()`, `Query.limit()`, `Query.offset()`, etc.
- Mark tech debt with `@todo` annotations, never `@fixme`
- Don't add new dependencies without consulting the team

## Environment variables

Set via `.env` (copy `.env.example`). All prefixed with `PUBLIC_` for SvelteKit:

| Variable                             | Default               | Purpose                        |
| ------------------------------------ | --------------------- | ------------------------------ |
| `PUBLIC_CONSOLE_MODE`                | `self-hosted`         | `cloud` or `self-hosted`       |
| `PUBLIC_APPWRITE_ENDPOINT`           | `http://localhost/v1` | API endpoint                   |
| `PUBLIC_APPWRITE_MULTI_REGION`       | `false`               | Multi-region support           |
| `PUBLIC_STRIPE_KEY`                  | --                    | Stripe public key (cloud only) |
| `PUBLIC_GROWTH_ENDPOINT`             | --                    | Analytics endpoint             |
| `PUBLIC_CONSOLE_FEATURE_FLAGS`       | --                    | Feature flags                  |
| `PUBLIC_CONSOLE_EMAIL_VERIFICATION`  | `false`               | Require email verification     |
| `PUBLIC_CONSOLE_MOCK_AI_SUGGESTIONS` | `true`                | Mock AI in dev                 |

## Common pitfalls

- **Blank page in dev:** Disable ad blockers if seeing "Failed to fetch dynamically imported module"
- **OOM on build:** Set `NODE_OPTIONS=--max_old_space_size=8192`
- **Test failures:** Always use `bun run tests` (runs test:unit with TZ=EST, plus test:e2e), not `bun test` directly
- **TS errors not showing:** Run `bun run check` explicitly (dev server doesn't always surface them)
- **Format vs lint conflicts:** Run `bun run format` before `bun run lint`
- **Stale build:** Clear `.svelte-kit` if changes not reflected: `rm -rf .svelte-kit && bun run build`

## Branch naming

`TYPE-ISSUE_ID-DESCRIPTION` (e.g. `feat-548-add-backup-ui`). Types: feat, fix, doc, cicd, refactor.

## Cross-repo context

The `feat-dedicated-db` feature spans cloud, edge, and console. When modifying API contracts or response models, check the other repos for breaking changes.
