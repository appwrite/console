import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
    plugins: [sveltekit()],
    optimizeDeps: {
        include: ['echarts']
    },
    ssr: {
        noExternal: ['echarts']
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
        threads: true,
        globals: true,
        setupFiles: ['./tests/unit/setup.ts']
    }
};

export default config;
