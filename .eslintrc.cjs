module.exports = {
    root: true,
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:svelte/recommended',
        'prettier'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        extraFileExtensions: ['.svelte'], // This is a required setting in `@typescript-eslint/parser` v4.24.0.
        sourceType: 'module',
        ecmaVersion: 2020
    },
    ignorePatterns: ['*.cjs'],
    overrides: [
        {
            files: ['*.svelte'],
            parser: 'svelte-eslint-parser',
            parserOptions: {
                parser: '@typescript-eslint/parser' //This is required to parse TypeScript inside Svelte files.
            }
        }
    ],
    rules: {
        'no-redeclare': 'off',
        '@typescript-eslint/no-duplicate-enum-values': 'off',
        'svelte/no-at-html-tags': 'off',
        'no-unused-vars': 'off', // This rule is handled by `@typescript-eslint/no-unused-vars` so it needs to be disabled to avoid conflicts.
        '@typescript-eslint/no-unused-vars': [
            'error',
            { argsIgnorePattern: '^_', varsIgnorePattern: '^(_|\\$\\$)' } // Ignore unused variables starting with `_` or `$$`.
        ]
    },
    env: {
        browser: true,
        es2017: true,
        node: true
    },
    globals: {
        globalThis: false // false means it is not writeable
    }
};
