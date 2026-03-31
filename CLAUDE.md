# Appwrite Console

SvelteKit web dashboard for Appwrite. Manages projects, databases, functions, auth, storage, and messaging.

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server (Vite) |
| `pnpm build` | Production build |
| `pnpm check` | Svelte type checking |
| `pnpm format` | Format with Prettier |
| `pnpm clean` | Clean build artifacts |

## Stack

- SvelteKit + TypeScript
- Vite for bundling
- Appwrite Pink design system (`@appwrite.io/pink-svelte`)
- CodeMirror for code editing
- Prettier for formatting, svelte-check for type checking

## Architecture

- `src/routes/` — SvelteKit file-based routing
- `src/lib/` — shared components, stores, helpers
- `src/lib/stores/` — Svelte stores for app state
- Uses Appwrite SDK for all backend communication

## Cross-repo context

The `feat-dedicated-db` feature spans cloud, edge, and console. When modifying API contracts or response models, check the other repos for breaking changes.
