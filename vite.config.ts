import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

const config = defineConfig({
    plugins: [sveltekit()],
    optimizeDeps: {
        include: ['echarts', 'prismjs']
    },
    ssr: {
        noExternal: ['echarts', 'prismjs', '@analytics/google-analytics', 'analytics', 'dayjs']
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
});

const testConfig = defineConfig({
    resolve: {
        // hotfix for https://github.com/vitest-dev/vitest/issues/2834
        conditions: ['browser']
    },
    test: {
        include: ['tests/unit/**/*.test.ts'],
        environment: 'jsdom',
        globals: true,
        threads: true,
        setupFiles: ['./tests/unit/setup.ts'],
        deps: {
            inline: ['@analytics/type-utils']
        }
    }
});

export default process.env.VITEST
    ? {
          ...config,
          ...testConfig
      }
    : config;
