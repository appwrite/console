import adapter from '@sveltejs/adapter-auto';
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
        adapter: adapter(),
        paths: {
            base: ''
        }
    }
};

export default config;
