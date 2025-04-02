import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { sentrySvelteKit } from '@sentry/sveltekit';
import { svelteTesting } from '@testing-library/svelte/vite';

export default defineConfig({
    plugins: [
        sentrySvelteKit({
            adapter: 'auto',
            sourceMapsUploadOptions: {
                org: 'appwrite',
                project: 'console'
            }
        }),
        sveltekit(),
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
    },
    test: {
        workspace: [
            {
                extends: './vite.config.ts',
                plugins: [svelteTesting()],
                test: {
                    name: 'client',
                    environment: 'jsdom',
                    clearMocks: true,
                    include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
                    exclude: ['src/lib/server/**'],
                    setupFiles: ['./vitest-setup-client.ts']
                }
            },
            {
                extends: './vite.config.ts',
                test: {
                    name: 'server',
                    environment: 'node',
                    include: ['src/**/*.{test,spec}.{js,ts}'],
                    exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
                }
            }
        ]
    }
});
