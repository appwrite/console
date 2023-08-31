module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    extends: [  'eslint:recommended', 'plugin:svelte/recommended','prettier'],
    ignorePatterns: ['*.cjs'],
    overrides: [
        {
            files: ['*.svelte'],
            parser: 'svelte-eslint-parser',
            rules: {
                'no-redeclare': 'off'
            }
        }
    ],
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2020
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
