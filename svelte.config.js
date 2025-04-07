import adapter from '@sveltejs/adapter-static';
import { sveltePreprocess } from 'svelte-preprocess';
import { preprocessMeltUI, sequence } from '@melt-ui/pp';
import 'dotenv/config';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: sequence([
        sveltePreprocess({
            scss: {
                silenceDeprecations: ['legacy-js-api']
            }
        }),
        preprocessMeltUI()
    ]),
    compilerOptions: {
        accessors: !!process.env.VITEST
    },

    kit: {
        alias: {
            $routes: './src/routes',
            $themes: './src/themes'
        },
        adapter: adapter({
            fallback: 'index.html',
            precompress: true
        }),
        paths: {
            base: `/console`
        }
    },
    vitePlugin: {
        inspector: {
            toggleKeyCombo: 'meta-shift-i'
        }
    }
};

export default config;
