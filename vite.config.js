import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
    plugins: [sveltekit()],
    optimizeDeps: {
        include: ['echarts', 'prismjs']
    },
    ssr: {
        noExternal: ['echarts', 'prismjs', '@analytics/google-analytics', 'analytics']
    },
    define: {
        'import.meta.env.VERCEL_ANALYTICS_ID': JSON.stringify(process.env.VERCEL_ANALYTICS_ID)
    },
    legacy: {
        buildSsrCjsExternalHeuristics: true
    },
    server: {
        port: 3000
    }
};

/** @type {import('vite').UserConfig} */
const testConfig = {
    resolve: {
        // hotfix for https://github.com/vitest-dev/vitest/issues/2834
        conditions: ['browser']
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

export default process.env.VITEST
    ? {
          ...config,
          ...testConfig
      }
    : config;
