![Appwrite](github.png)

# @appwrite/console

This is the base project for the new dashboard for Appwrite.

Built with:

- [Svelte](https://svelte.dev/)
- [Svelte Kit](https://kit.svelte.dev/)
- [@appwrite/ui](https://github.com/appwrite/ui)

Table of Contents:

- [Development](#development)
  - [Build](#build)
  - [Tests](#tests)
  - [Format](#format)
  - [Linter](#linter)
  - [Diagnostics](#diagnostics)
- [Contributing](#contributing)
  - [Guidelines](#guidelines)
  - [Structure](#structure)

# Development

Once you've created a project and installed dependencies with `npm install`, start a development server:

```bash
npm run dev
```

## Build

```bash
npm run build
```

> You can preview the built app with `npm run preview`, regardless of whether you installed an adapter. This should _not_ be used to serve your app in production.

## Tests

```bash
npm test
```

This will run tests in the `tests/` directory.

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

# Contributing

## Guidelines

### Consistency

Before commiting always make sure to run all available tools to improve the codebase:
- Formatter
  - `npm run format`
- Tests
  - `npm test`
- Diagnostics
  - `npm run check`

### Performance

Page load times are a key consideration for users of all browsers and device types.

There are some general things we can do in front-end development:

- Minimise HTTP requests
- Minimise blocking – content should be readable before client side processing
- Lazy load 'supplementary' content (especially images)

### Don't Repeat Yourself (DRY)

If you repeat anything that has already been defined in code, refactor it so that it only ever has one representation in the codebase.

If you stick to this principle, you will ensure that you will only ever need to change one implementation of a feature without worrying about needing to change any other part of the code.

### Separation of concerns

Separate _structure_ from _presentation_ from _behaviour_ to aid maintainability and understanding.

- Keep CSS (presentation), JS (behaviour) and HTML (structure) in the same respective Svelte component
- Avoid writing inline CSS or Javascript in HTML
- Avoid writing CSS or HTML in Javascript
- Don't choose HTML elements to imply style
- Where appropriate, use CSS or Svelte rather than Javascript for animations and transitions
- Try to use templates when defining markup in Javascript

### Write code to be read

Follow the principles of ['Keep It Simple, Stupid'](http://en.wikipedia.org/wiki/KISS_principle) (KISS); hard to read or obfuscated code is difficult to maintain and debug. Don't be too clever; write code to be read.

### Identify technical debt

Use code comment annotations (`@todo`) to mark parts of your code that require further work. This will allow the measurement and management of technical debt.

Don't use `@fixme` (which defines things that are broken) - you shouldn't be committing broken code to the repo.

### Dependencies

Please avoid introducing new dependencies to Appwrite without consulting the team. New dependencies can be very helpful but also introduce new security and privacy issues, complexity, and impact total docker image size.

Adding a new dependency should have vital value on the product with minimum possible risk.

## Structure

```
├── src
│   ├── lib                             // All non-route components, accessible over "import ... from '$lib'"
│   │   ├── components                  // Re-usable components
│   │   ├── elements                    // Re-usable elements
│   │   ├── layout                      // Global components for the layout (Nav/Content/Container)
│   │   └── stores                      // Global stores (state management)
│   └─── routes
│       ├── console                     // Routes that need authentication
│       │   ├──[project]
│       │   │   ├── database            // Database Service
│       │   │   │   ├── [collection]    // Nested Route for the collection "/console/[PROJECT_ID]/database/[COLLECTION_ID]"
│       │   │   │   ├── _create.svelte  // Component to Create collections
│       │   │   │   └── index.svelte    // Entrypoint for "/console/[PROJECT_ID]/database"
│       │   │   ├── storage             // Storage Service "/console/[PROJECT]/storage"
│       │   │   └── users               // Users Service "/console/[PROJECT]/users"
│       │   └──...
│       ├── login.svelte                // Component for Login "/console/login"
│       └── register.svelte             // Component for Register "/console/register"
├── build // Compiled application
└── static // Static assets
```
