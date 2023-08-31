module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:svelte/recommended',
        'prettier'
    ],
    ignorePatterns: ['*.cjs'],
    overrides: [
        {
            files: ['*.svelte'],
            parser: 'svelte-eslint-parser',
            parserOptions: {
                parser: '@typescript-eslint/parser',
                sourceType: 'module',
                ecmaVersion: 2020
            },
            rules: {
                'no-redeclare': 'off'
            }
        }
    ],
    env: {
        browser: true,
        es2017: true,
        node: true
    },
    globals: {
        globalThis: false // false means it is not writeable
    }
};
