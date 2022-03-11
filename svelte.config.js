import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),
	kit: {
		adapter: adapter(),
		prerender: {
			default: true
		},
		trailingSlash: 'always',
		vite: {
			define: {
				__APP_VERSION__: JSON.stringify(process.env.npm_package_version)
			}
		}
	}
};

export default config;
