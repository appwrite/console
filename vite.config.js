import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
    plugins: [sveltekit()],
    optimizeDeps: {
        include: ['echarts', 'prismjs']
    },
    ssr: {
        noExternal: ['echarts', 'prismjs']
    },
    define: {
        'import.meta.env.VERCEL_ANALYTICS_ID': JSON.stringify(process.env.VERCEL_ANALYTICS_ID)
    },
    legacy: {
        buildSsrCjsExternalHeuristics: true
    },
    server: {
        port: 3000
    },
    test: {
        include: ['tests/**/*.test.ts'],
        environment: 'jsdom',
        globals: true,
        threads: true,
        setupFiles: ['./tests/unit/setup.ts'],
        deps: {
            inline: ['@analytics/type-utils']
        }
    }
};

export default config;
