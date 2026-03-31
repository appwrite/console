# Appwrite Console

SvelteKit web dashboard for Appwrite. Manages projects, databases, functions, auth, storage, messaging, and sites.

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server (port 3000) |
| `pnpm build` | Production build (`bun run build.js`) |
| `pnpm check` | `svelte-kit sync && svelte-check` |
| `pnpm format` | Prettier write + cache |
| `pnpm lint` | Prettier check + ESLint |
| `pnpm test:unit` | Vitest (TZ=EST) |
| `pnpm test:unit-watch` | Vitest watch mode |
| `pnpm test:e2e` | Playwright |
| `pnpm clean` | Remove node_modules, .svelte-kit, reinstall |

## Stack

- **Framework:** SvelteKit 2 + Svelte 5, TypeScript, static adapter
- **Bundler:** Vite (rolldown-vite)
- **Design system:** `@appwrite.io/pink-svelte`, `@appwrite.io/pink-icons-svelte`
- **UI primitives:** Melt UI (`@melt-ui/svelte`)
- **API client:** `@appwrite.io/console` SDK
- **Code editing:** CodeMirror 6
- **Charts:** ECharts
- **Payments:** Stripe
- **Testing:** Vitest + @testing-library/svelte (unit), Playwright (e2e)
- **Error tracking:** Sentry (`@sentry/sveltekit`)

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

### Library (`src/lib/`)

| Directory | Contents |
|-----------|----------|
| `components/` | Feature components (billing, permissions, filters, etc.) |
| `elements/forms/` | Form inputs (text, email, phone, OTP, file, geometry, etc.) |
| `elements/table/` | Table components |
| `layout/` | Shell, Container, Wizard, Breadcrumbs, Navigation |
| `stores/` | Svelte stores for global state |
| `helpers/` | Utilities (array, date, object, numbers, string, validation) |
| `sdk/` | Custom SDK extensions (billing, usage, sources) |
| `actions/` | Svelte actions and analytics tracking |
| `charts/` | Chart visualization components |
| `commandCenter/` | Command palette |
| `profiles/` | CSS profiles and theming |
| `mock/` | Mock data for development |

### SDK usage (`src/lib/stores/sdk.ts`)

Three client instances: `clientConsole` (console API), `clientProject` (project API, admin mode), `clientRealtime` (realtime subscriptions). Region-aware endpoints with subdomain support (fra., nyc., syd., sfo., sgp., tor.).

```typescript
import { sdk } from '$lib/stores/sdk';

// Console-level operations
await sdk.forConsole.account.get();

// Region-scoped console operations
await sdk.forConsoleIn(region).projects.get({ projectId });

// Project-level operations (admin mode)
await sdk.forProject(region, projectId).tablesDB.listTables();
```

### Data loading pattern

Load functions declare dependencies for cache invalidation via `depends()`:
```typescript
export const load: LayoutLoad = async ({ depends, parent, params }) => {
    depends(Dependencies.DATABASE);
    return { database: await sdk.forProject(...).tablesDB.get(...) };
};
```
Invalidate with `await invalidate(Dependencies.DATABASE)` after mutations.

### State management

Stores in `src/lib/stores/` — writable, derived, and "conservative" (selective update) patterns. Key stores: `app`, `user`, `organization`, `projects`, `billing`, `wizard`, `notifications`, `sdk`. Stores often derive from SvelteKit's `page` store for route-aware state.

### Theming

Four theme variants: `light`, `dark`, `light-cloud`, `dark-cloud` (JSON files in `src/themes/`). Resolved based on `isCloud` flag and user preference.

### Modes (`src/lib/system.ts`)

Two modes: `cloud` and `self-hosted`, set via `PUBLIC_CONSOLE_MODE` env var. Gate cloud-only features with `isCloud`.

## Code style

- **Formatting:** Prettier — 4 spaces, single quotes, no trailing commas, 100 char width, bracket same line
- **Always run `pnpm format` before committing** — the project uses `prettier --cache`
- Types from `@appwrite.io/console` SDK (`Models`, `Query`, enums) — don't redefine what the SDK provides
- Error handling: try/catch with `addNotification()` for user-facing errors, `trackError()` for analytics
- Queries use the SDK's `Query` builder: `Query.equal()`, `Query.limit()`, `Query.offset()`, etc.

## Cross-repo context

The `feat-dedicated-db` feature spans cloud, edge, and console. When modifying API contracts or response models, check the other repos for breaking changes.
