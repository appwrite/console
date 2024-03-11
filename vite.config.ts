import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

const config = defineConfig({
    plugins: [sveltekit()],
    optimizeDeps: {
        include: ['echarts', 'prismjs']
    },
    ssr: {
        noExternal: [
            '@analytics/google-analytics',
            '@sentry/browser',
            '@sentry-internal/tracing',
            'analytics',
            'dayjs',
            'dotenv',
            'echarts',
            'prismjs',
            'zrender'
        ]
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
        pool: 'threads',
        setupFiles: ['./tests/unit/setup.ts'],
        deps: {
            optimizer: {
                web: {
                    include: ['@analytics/type-utils']
                }
            }
        },
        server: {
            deps: {
                inline: ['@analytics/type-utils']
            }
        }
    }
});

export default process.env.VITEST
    ? {
          ...config,
          ...testConfig
      }
    : config;
