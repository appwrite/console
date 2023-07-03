import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessors
    preprocess: preprocess(),
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
        experimental: {
            inspector: true
        }
    }
};

export default config;
