# appwrite-console-poc

This is a PoC that was a result of about 2 hours coding, investigating a possible structure of the new console.

For simplicity I used [Pico CSS](https://picocss.com/) and didn't focus on styling at all.

Therefore, Pico CSS is the only Dependency that got added beside necessary ones from Svelte and Developer Tooling (Sass, Linter, Formatter, etc).
## Structure

```
├── src
│   ├── lib                             // All non-route components, accessible over "import ... from '$lib'"
│   │   ├── components                  // Re-usable components (with more components they will also be structured inside)
│   │   ├── layout                      // Global components for the layout (Nav/Content/Container)
│   │   └── stores                      // Global stores (state management)
│   └├── routes
│       ├── console                     // Routes that need authentication
│       │   └──[project]
│       │       ├── database            // Database Service
│       │       │   ├── [collection]    // Nested Route for the collection "/console/[PROJECT_ID]/database/[COLLECTION_ID]"
│       │       │   ├── _create.svelte  // Component to Create collections
│       │       │   └── index.svelte    // Entrypoint for "/console/[PROJECT_ID]/database"
│       │       ├── storage             // Storage Service "/console/[PROJECT]/storage"
│       │       └── users               // Users Service "/console/[PROJECT]/users"
│       ├── login.svelte                // Component for Login "/console/login"
│       └── register.svelte             // Component for Register "/console/register"
├── build // Compiled application
└── static // Static assets
```

## Developing

Once you've created a project and installed dependencies with `npm install`, start a development server:

```bash
npm run dev
```
## Building

```bash
npm run build
```

> You can preview the built app with `npm run preview`, regardless of whether you installed an adapter. This should _not_ be used to serve your app in production.


## Format

Code should like everywhere the same, for this reason a code-formatter is mandatory.

```bash
npm run format
```

## Linter

```bash
npm run lint
```

## Diagnostics

Diagnostic tool that checks for following:

- Unused CSS
- Svelte A11y hints
- TypeScript compiler errors

```bash
npm run check
```