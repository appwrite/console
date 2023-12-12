import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';
import { preprocessMeltUI } from '@melt-ui/pp';
import sequence from 'svelte-sequential-preprocessor';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessors
    preprocess: sequence([preprocess(), preprocessMeltUI()]),
    compilerOptions: {
        accessors: process.env.VITEST
    },
    kit: {
        alias: {
            $routes: './src/routes'
        },
        adapter: adapter({
            fallback: 'index.html'
        }),
        paths: {
            base: ''
        }
    },
    vitePlugin: {
        inspector: {
            toggleKeyCombo: 'meta-shift-i'
        }
    }
};

export default config;
