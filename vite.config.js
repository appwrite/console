import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
    plugins: [sveltekit()],
    optimizeDeps: {
        include: ['echarts']
    },
    ssr: {
        noExternal: ['echarts']
    }
};

export default config;
