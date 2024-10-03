import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { sentrySvelteKit } from '@sentry/sveltekit';

const config = defineConfig({
    plugins: [
        sentrySvelteKit({
            adapter: 'auto',
            sourceMapsUploadOptions: {
                org: 'appwrite',
                project: 'console'
            }
        }),
        sveltekit()
    ],
    optimizeDeps: {
        include: ['echarts', 'prismjs']
    },
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: ['legacy-js-api']
            }
        }
    },
    ssr: {
        noExternal: [
            '@analytics/google-analytics',
            'analytics',
            'dayjs',
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
