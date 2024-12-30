# Contributing

We would ❤️ for you to contribute to Appwrite and help make it better! We want your experience while contributing to Appwrite to be fun, enjoyable, and educational for anyone and everyone. All contributions are welcome, including issues, and new docs, as well as updates and tweaks, blog posts, workshops, and more.

## How to Start?

If you are worried about or don't know where to start, check out the next section that explains what kind of help is needed and how you can get involved. You can reach out with any questions on our [Discord](https://appwrite.io/discord) server. You can also submit an issue and a maintainer can guide you!

## Repo Structure

```
├── src
│   ├── lib                                       // Reusable logic (accessible with '$lib')
│   │   ├── actions                               // Svelte actions
│   │   ├── charts                                // Chart components
│   │   ├── components                            // Re-usable components
│   │   ├── elements                              // Re-usable elements
│   │   ├── helpers                               // Small functions used through out the console
│   │   ├── images                                // Images used in the console
│   │   ├── layout                                // Global components for the layout (Nav/Content/Container)
│   │   ├── mock                                  // Mock components used for testing
│   │   └── stores                                // Global stores (state management)
│   └── routes
│       └── console                               // Routes that need authentication
│       │   └── project-[project]
│       │   │   └── database                      // Database Service
│       │   │   │   ├── +layout.svelte            // Layout head and other logic like realtime events is set here
│       │   │   │   ├── +layout.ts                // Layout data is set here (Header, Breadcrumbs, ...)
│       │   │   │   ├── +page.svelte              // Page displayed on "/console/project-[PROJECT_ID]/database"
│       │   │   │   ├── +page.ts                  // Necessary data for the page is fetched here
│       │   │   │   └── create.svelte             // Component to create databases
│       │   │   └── ...                           // Other services
│       │   └── ...
│       └── ...                                   // Routes that don't need authentication
├── build                                         // Compiled application
└── static                                        // Static assets
```

## Development

### 1. Clone the repository with git

```bash
git clone https://github.com/appwrite/console.git appwrite-console
```

### 2. Install dependencies with npm

Navigate to the Appwrite Console repository and install dependencies.

```bash
cd appwrite-console && pnpm install
```

### 3. Install and run Appwrite locally

When you run the Appwrite Console locally, it needs to point to a backend as well. The easiest way to do this is to run an Appwrite instance locally.

Follow the [install instructions](https://appwrite.io/docs/advanced/self-hosting) in the Appwrite docs.

### 4. Setup environment variables

Add a `.env` file by copying the `.env.example` file as a template in the project's root directory.

> **Note**
> If you are updating from Appwrite `1.5.x`, be aware that the variables for the console in the `.env` / `.env.example` file have changed in `1.6.x`.

Finally, start a development server:

```bash
pnpm dev
```

> **Note**
> If http://localhost:3000 is blank and the browser console logs have a `TypeError: Failed to fetch dynamically imported module: http://localhost:3000/.svelte-kit/generated/nodes/0.js` error, try to turn off any ad blocker you have and reload the page ([reference](https://github.com/sveltejs/kit/issues/3308#issuecomment-1149942109)).

### Build

```bash
pnpm build
```

> You can preview the built app with `npm run preview`, regardless of whether you installed an adapter. This should _not_ be used to serve your app in production.

### Tests

```bash
pnpm test
```

This will run tests in the `tests/` directory.

### Format

Code should be consistently formatted everywhere. Before committing code, run the code-formatter.

```bash
pnpm run format
```

### Linter

```bash
pnpm run lint
```

### Diagnostics

Diagnostic tool that checks for the following:

- Unused CSS
- Svelte A11y hints
- TypeScript compiler errors

```bash
pnpm run check
```

## Submit a Pull Request 🚀

The branch naming convention is as follows

`TYPE-ISSUE_ID-DESCRIPTION`

example:

```
doc-548-submit-a-pull-request-section-to-contribution-guide
```

When `TYPE` can be:

- **feat** - is a new feature
- **doc** - documentation only changes
- **cicd** - changes related to CI/CD system
- **fix** - a bug fix
- **refactor** - code change that neither fixes a bug nor adds a feature

**All PRs must include a commit message with a description of the changes made!**

Start by forking the project and use the `git clone` command to download the repository to your computer. A standard procedure for working on an issue would be to:

1. Before creating a new branch, pull the changes from upstream to make sure your default branch is up to date.

```
$ git pull
```

2. Create a new branch from the default branch. For example `doc-548-submit-a-pull-request-section-to-contribution-guide`

```
$ git checkout -b [name_of_your_new_branch]
```

3. Work - commit - repeat ( be sure to be in your branch )
4. Push changes to GitHub

```
$ git push origin [name_of_your_new_branch]
```

6. Submit your changes for review. If you go to your repository on GitHub, you'll see a `Compare & pull request` button. Click on that button.
7. Start a Pull Request (PR) by clicking on `Create pull request`. Make sure to update the PR description following the template provided.
8. Wait for a code review.
9. If you need to make changes based on feedback, make sure to re-request a review from your reviewer after you've made the necessary changes.

![Re-Request a Review](https://docs.github.com/assets/cb-4714/images/help/pull_requests/request-re-review.png)

10. After approval, your PR will be merged.
11. You can delete your branch after it has been merged.

## Guidelines

### Consistency

Before committing always make sure to run all available tools to improve the codebase:

- Formatter
    - `pnpm run format`
- Tests
    - `pnpm test`
- Diagnostics
    - `pnpm run check`

### Performance

Page load times are a key consideration for users of all browsers and device types.

There are some general things we can do in front-end development:

- Minimize HTTP requests
- Minimize blocking – content should be readable before client-side processing
- Lazy load "supplementary" content, especially images

### Don't Repeat Yourself (DRY)

If you repeat anything that has already been defined in code, refactor it so that it only ever has one representation in the codebase.

If you stick to this principle, you will ensure that you will only ever need to change one implementation of a feature without worrying about the need to change any other part of the code.

### Separation of concerns

Separate _structure_ from _presentation_ from _behavior_ to aid maintainability and understanding.

- Keep CSS (presentation), JS (behavior) and HTML (structure) in the same respective Svelte component
- Avoid writing inline CSS or Javascript in HTML
- Avoid writing CSS or HTML in Javascript
- Don't choose HTML elements to imply style
- Where appropriate, use CSS or Svelte rather than Javascript for animations and transitions
- Try to use templates when defining markup in Javascript

### Write code to be read

Follow the principles of ['Keep It Simple, Stupid'](http://en.wikipedia.org/wiki/KISS_principle) (KISS); hard-to-read or obfuscated code is difficult to maintain and debug. Don't be too clever; write code to be read.

### Identify technical debt

Use code comment annotations (`@todo`) to mark parts of your code that require further work. This will allow the measurement and management of technical debt.

Don't use `@fixme`, which defines things that are broken. Don't commit broken code in to the repo.

### Dependencies

Please avoid introducing new dependencies to Appwrite without consulting the team. New dependencies can be very helpful, but they also introduce new security and privacy issues, complexity, and impact total docker image size.

Adding a new dependency should contribute vital value to the product with minimum possible risk.

## Introducing New Features

We would 💖 you to contribute to Appwrite, but we also want to ensure Appwrite is loyal to its vision and mission statement 🙏.

For us to find the right balance, please open an issue explaining your ideas before introducing a new pull request.

This will allow the Appwrite community to sufficiently discuss the new feature value and how it fits within the product roadmap and vision.

This is also important for the Appwrite lead developers to be able to provide technical input and potentially a different emphasis regarding the feature design and architecture. Some bigger features might need to go through our [RFC process](https://github.com/appwrite/rfc).

## Other Ways to Help

Pull requests are great, but there are many other areas where you can help Appwrite.

### Blogging & Speaking

When blogging, speaking about, or creating tutorials about one of Appwrite's many features, mention [@appwrite](https://twitter.com/appwrite) on Twitter and/or email [team@appwrite.io](mailto:team@appwrite.io) so we can give pointers and tips and help you spread the word by promoting your content on the different Appwrite communication channels. Please add your blog posts and videos of talks to our [Awesome Appwrite](https://github.com/appwrite/awesome-appwrite) repo on GitHub.

### Presenting at Meetups

Presenting at meetups and conferences about your Appwrite projects is another excellent way to get the word out about Appwrite. Your unique challenges and successes in building things with Appwrite can provide great speaking material. We'd love to review your talk abstract/CFP, so get in touch with us if you'd like some help!

### Sending Feedback & Reporting Bugs

Sending feedback is an excellent way for us to understand different use cases for Appwrite. If you have any issues or want to share your experience, feel free to do so on our GitHub issues page or our [Discord channel](https://discord.gg/GSeTUeA).

### Submitting New Ideas

If you think Appwrite could use a new feature, please open an issue on our GitHub repository, stating as much information as you can think about your new idea and its implications. We would also use this issue to gather more information, get more feedback from the community, and have a proper discussion about the new feature.

### Improving Documentation

Submitting documentation updates, enhancements, designs, or bug fixes help us to improve our documentation. Spelling or grammar fixes are also very much appreciated.

### Helping Someone

You can also help by teaching others how to contribute to Appwrite's repo! Please consider searching for Appwrite on Discord, GitHub, or StackOverflow and helping someone else who needs help.

## Code of Conduct

Help us keep Appwrite open and inclusive. Please read and follow our [Code of Conduct](https://github.com/appwrite/.github/blob/main/CODE_OF_CONDUCT.md).
