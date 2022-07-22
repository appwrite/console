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
    legacy: {
        buildSsrCjsExternalHeuristics: true
    },
    server: {
        port: 3000
    }
};

export default config;
