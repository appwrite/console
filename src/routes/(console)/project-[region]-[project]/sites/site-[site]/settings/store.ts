import { writable } from 'svelte/store';

export const showConnectRepo = writable(false);

export const adapterDataList = [
    {
        framework: 'sveltekit',
        ssr: {
            desc: 'Use $ adapter in $ file.',
            code: ['@sveltejs/adapter-node', 'svelte.config.js'],
            url: 'https://kit.svelte.dev/docs#adapter-node'
        },
        static: {
            desc: 'Use $ adapter in $ file.',
            code: ['@sveltejs/adapter-static', 'svelte.config.js'],
            url: 'https://kit.svelte.dev/docs#adapter-static'
        }
    },
    {
        framework: 'astro',
        ssr: {
            desc: 'Use $ adapter in $ file.',
            code: ['@astro/node', 'astro.config.mjs'],
            url: 'https://docs.astro.build/en/guides/server-side-rendering/'
        },
        static: {
            desc: "Ensure you don't set $ adapter in $ file.",
            code: ['adapter', 'astro.config.mjs'],
            url: 'https://docs.astro.build/en/guides/deploy/'
        }
    },
    {
        framework: 'remix',
        ssr: {
            desc: 'Ensure $ file uses $ package.',
            code: ['entry.server.tsx', '@remix-run/node']
        },
        static: {
            desc: 'Set $ in $ plugin in $ file.',
            code: ['ssr: false', 'remix', 'vite.config.ts']
        }
    },
    {
        framework: 'nuxt',
        ssr: {
            desc: 'Set build command to $ in site settings.',
            code: ['npm run build'],
            url: 'https://nuxt.com/docs/getting-started/deployment'
        },
        static: {
            desc: 'Set build command to $ in site settings.',
            code: ['npm run generate'],
            url: 'https://nuxt.com/docs/getting-started/deployment#static-hosting'
        }
    },
    {
        framework: 'nextjs',
        ssr: {
            desc: "Ensure you don't set $ in $ file.",
            code: ['output', 'next.config.js'],
            url: 'https://nextjs.org/docs/pages/building-your-application/deploying'
        },
        static: {
            desc: 'Set $ in $ file',
            code: ["output: 'export'", 'next.config.js'],
            url: 'https://nextjs.org/docs/pages/building-your-application/deploying/static-exports'
        }
    },
    {
        framework: 'analog',
        ssr: {
            desc: 'Set $ in $ plugin in $',
            code: ['ssr: true', 'analog', 'vite.config.ts'],
            url: 'https://analogjs.org/docs/features/server/server-side-rendering'
        },
        static: {
            desc: 'Set $ in $ plugin in $',
            code: ['static: true', 'analog', 'vite.config.ts'],
            url: 'https://analogjs.org/docs/features/server/static-site-generation'
        }
    },
    {
        framework: 'angular',
        ssr: {
            desc: 'Ensure $ file uses $ package.',
            code: ['src/server.ts', '@angular/ssr/node'],
            url: 'https://angular.dev/guide/ssr'
        },
        static: {
            desc: "Angular's default build is static. No further action needed."
        }
    }
];
