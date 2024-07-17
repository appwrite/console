import adapter from '@sveltejs/adapter-static';
import { sveltePreprocess } from 'svelte-preprocess';
import { preprocessMeltUI, sequence } from '@melt-ui/pp';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: sequence([sveltePreprocess(), preprocessMeltUI()]),
    compilerOptions: {
        accessors: !!process.env.VITEST
    },
    kit: {
        alias: {
            $routes: './src/routes'
        },
        adapter: adapter({
            fallback: 'index.html',
            precompress: true
        }),
        paths: {
            base: '/console'
        }
    },
    vitePlugin: {
        inspector: {
            toggleKeyCombo: 'meta-shift-i'
        }
    }
};

export default config;
